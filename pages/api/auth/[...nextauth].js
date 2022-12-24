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

  const assignMember = async (user) => {
    const member = await Member.findOne({
      where: { email: user.email },
    });

    // find if member is already created, update users' member_id if true
    if (member) {
      await User.update(
        { member_id: member.id },
        { where: { id: user.email } }
      );
    } else {
      // create a member if member is not found and update users' member_id
      const result = await Member.create({ email: user.email });
      await User.update(
        { member_id: result.id },
        { where: { id: user.email } }
      );
    }
  };

  const findUser = async (user) => {
    const result = await User.findOne({ where: { email: user.email } });
    return result ? true : false;
  };

  const deleteUser = async (user) => {
    await User.destroy({ where: { email: user.email } });
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
    async linkAccount({ user, providerAccount, account }) {
      console.log("===================linkAccountStart");
      // modify account
      await Account.update(
        { user_id: user.email },
        { where: { provider_account_id: account.providerAccountId } }
      );
      // console.log(user);
      // console.log(providerAccount);
      // console.log(account);
      console.log("===================linkAccountEnd");
    },

    async session({ session, token }) {
      console.log("===================sessionStart");
      // console.log(session);
      console.log("===================sessionEnd");
    },

    async signIn({ user, account, profile, isNewUser }) {
      console.log("===================signInStart");

      // find if the account with the same email is already exist, delete it if true
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

      // find if the session with the same email is already exist, delete it if true
      const former_session = await Session.findOne({
        where: { user_id: user.email },
      });

      if (former_session) {
        await Session.destroy({
          where: { user_id: user.email },
        });
      }

      // modify session
      await Session.update(
        { user_id: user.email },
        { where: { user_id: user.id } }
      );
      // console.log(user);
      // console.log(account);
      // console.log(profile);
      // console.log(isNewUser);
      console.log("===================signInEnd");
    },

    async updateUser({ user }) {
      console.log("===================updateUserStart");
      // console.log(user);
      console.log("===================updateUserEnd");
    },

    async createUser({ user }) {
      console.log("===================createUserStart");
      // console.log(user);

      // modify user
      await User.update({ id: user.email }, { where: { id: user.id } });
      await assignMember(user);
      console.log("===================createUserEnd");
    },
  };

  const callbacks = {
    async signIn({ user, account, profile, email, credentials }) {
      // always delete user if find one
      const is_user_created = await findUser(user);

      if (is_user_created) {
        await deleteUser(user);
      }
      console.log("===================callbacksSignInStart");
      console.log(is_user_created);
      // console.log(user);
      // console.log("====Account");
      // console.log(account);
      // console.log("====profile");
      // console.log(profile);
      console.log("===================callbacksSignInEnd");
      return true;
    },

    async session({ session, token, user }) {
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
