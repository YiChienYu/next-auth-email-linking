"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  sessions.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      expires: { type: "TIMESTAMP" },
      session_token: DataTypes.STRING(1000),
      user_id: DataTypes.STRING,
    },
    { timestamps: false, sequelize, modelName: "sessions" }
  );
  return sessions;
};
