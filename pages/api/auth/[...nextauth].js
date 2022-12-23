require("dotenv").config();
import NextAuth from "next-auth";

import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LineProvider from "next-auth/providers/line";
import EmailProvider from "next-auth/providers/email";
import SequelizeAdapter, { models } from "@next-auth/sequelize-adapter";
import Sequelize, { DataTypes, where } from "sequelize";
import Cookies from "cookies";
import { html, text } from "./helper";
import nodemailer from "nodemailer";
import { User, Member, Account, Session } from "../../../models";
import dayjs from "dayjs";

export default async function auth(req, res) {
  const env = "development";
  const config = require("../../../config/config.js")[env];
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );

  const fromDate = (time, date = Date.now()) => {
    return new Date(date + time * 1000);
  };

  // 參數留user就好
  const assignProperAccount = async (user) => {
    console.log("========assignProperAccount");
    console.log(user);

    let isFound = false;
    if (user.email) {
      const c1 = await Member.findOne({
        where: { email: user.email },
      });
      if (c1) {
        isFound = true;
        await User.update({ member_id: c1.id }, { where: { id: user.email } });
      }
    }

    if (!isFound) {
      const member = await Member.create({
        user_id: user.email,
        email: user.email ? user.email : "",
      });

      await User.update(
        { member_id: member.id },
        { where: { email: user.email } }
      );
      console.log(member.id);
      console.log(isFound);
      console.log("========assignProperAccount");
    }
  };

  const providers = [
    EmailProvider({
      server: {
        host: process.env.SES_EMAIL_HOST,
        port: process.env.SES_EMAIL_SERVER_PORT,
        auth: {
          user: process.env.SES_EMAIL_USER,
          pass: process.env.SES_EMAIL_PASSWORD,
        },
      },
      from: `"nextauth" <no-reply@${process.env.SES_EMAIL_DOMAIN}>`,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        /* your function */
        const { host } = new URL(url);
        let transport = nodemailer.createTransport(server);

        if (process.env.APP_ENV != "production") {
          let testAccount = await nodemailer.createTestAccount();
          transport = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
            },
          });
        }

        let info = await transport.sendMail({
          to: email,
          from,
          subject: `Login to ${host}`,
          text: "Hello world",
          html: html({ url, host, email }),
        });

        if (process.env.APP_ENV != "production") {
          console.log("----------");
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          console.log("----------");
        }
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ];

  const events = {
    // linkAccount 發生在 createUser 之後
    async linkAccount({ user, providerAccount, account }) {
      console.log("========linkAccount");
      console.log(user);
      console.log(account);
      user.id = user.email;
      // account.user_id = user.email;
      await Account.update(
        { user_id: user.email },
        { where: { provider_account_id: account.providerAccountId } }
      );
      console.log("========linkAccount");
      // 參數留user就好
      await assignProperAccount(user);
    },

    async session({ session, token }) {
      console.log("===================session");
      console.log(session);
      console.log("===================session");
    },

    async signIn({ user, account }) {
      console.log("===================signIn");
      // console.log(req.method);
      console.log(user);
      console.log(account);
      console.log("===================signIn");

      const former = await Account.findOne(
        {
          where: {
            provider_account_id: account.providerAccountId,
            provider: account.provider,
            user_id: user.email,
          },
        },
        { order: [["createdAt", "ASC"]] }
      );
      console.log("====former");
      console.log(former);
      console.log("====former");

      if (
        former &&
        former.access_token !== account.access_token &&
        former.provider === account.provider &&
        former.provider_account_id === account["providerAccountId"] &&
        former.user_id === user.email
      ) {
        await Account.destroy({
          where: { id: former.id },
        });
      }

      await Session.update(
        { user_id: user.email },
        { where: { user_id: user.id } }
      );
    },

    async createUser({ user }) {
      console.log("===================createUser");
      // console.log(req.query.nextauth);
      console.log(user);
      user.id = user.email;

      await User.update(
        { id: user.email },
        {
          where: { email: user.email },
        }
      );
      // 這邊應該可以拿掉
      await assignProperAccount(user);

      console.log("===================createUser");
    },
  };

  const callbacks = {
    async signIn({ user, account, profile, email, credentials }) {
      console.log(user);
      console.log("====Account");
      console.log(account);
      console.log("====profile");
      console.log(profile);
      user.id = user.email;
      let params = Object.assign({}, req.query);

      if (
        !req.query.nextauth.includes("google") &&
        !req.query.nextauth.includes("facebook") &&
        !req.query.nextauth.includes("github")
      ) {
        delete params.nextauth;

        let targetUser = await User.findOne({
          where: { id: user.id },
        });

        if (targetUser) {
          params.image = null;
          user.name = null;
          await targetUser.update(user);
        } else {
          await User.create(Object.assign({}, user, params));
        }

        await assignProperAccount(user);
      } else {
        let targetUser = await User.findOne({
          where: { id: user.id },
        });
        if (targetUser) {
          await User.destroy({ where: { id: user.id } });
        }
      }

      return true;
    },

    async session({ session, token, user }) {
      const fs = require("fs");
      fs.appendFileSync("message.txt", "=========== IN Session\n");
      fs.appendFileSync("message.txt", JSON.stringify(user));

      session.user.id = user.id;
      session.user.name = user.name;
      session.user.email = user.email;
      session.user.image = user.image;

      const cookies = new Cookies(req, res);

      cookies.set(
        "next-auth.session-token",
        session,
        {
          expires: fromDate(session.maxAge),
        },
        { secure: true },
        { overwrite: true }
      );

      return session;
    },
  };

  return await NextAuth(req, res, {
    providers,
    callbacks,
    events,
    adapter: SequelizeAdapter(sequelize, {
      models: {
        User: sequelize.define("user", {
          ...models.User,
          // role_id: DataTypes.INTEGER,
        }),
      },
    }),

    secret: process.env.NEXTAUTH_SECRET,
    session: {
      maxAge: 3650 * 24 * 60 * 60, // 3650 days
    },
  });
}
