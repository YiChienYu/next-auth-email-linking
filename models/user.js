"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      emailVerified: { type: "TIMESTAMP" },
      image: DataTypes.STRING,
      member_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "users",
    }
  );

  User.beforeCreate(async (user, options) => {
    user.createdAt = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/g, "");
    user.updatedAt = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/g, "");

    let billingType = 1;
    if (user.company_name && user.company_name.length > 0) {
      billingType = 2;
    }
    // const [billingAccount, created] =
    //   await sequelize.models.billing_accounts.findOrCreate({
    //     where: { user_id: user.id },
    //     defaults: {
    //       billing_type: billingType,
    //       email: user.email ? user.email : "",
    //       phone: user.phone ? user.phone : "",
    //     },
    //   });
    // user.billing_account_id = billingAccount.id;
  });
  return User;
};
