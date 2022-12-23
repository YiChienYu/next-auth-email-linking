"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class accounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  accounts.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      type: DataTypes.STRING,
      provider: DataTypes.STRING,
      provider_account_id: DataTypes.STRING(1000),
      refresh_token: DataTypes.STRING(1000),
      access_token: DataTypes.STRING(1000),
      expires_at: DataTypes.INTEGER,
      token_type: DataTypes.STRING,
      scope: DataTypes.STRING,
      id_token: DataTypes.STRING(1000),
      session_state: DataTypes.STRING,
      user_id: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "accounts",
    }
  );
  return accounts;
};
