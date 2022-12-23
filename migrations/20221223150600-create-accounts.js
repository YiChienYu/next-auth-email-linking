"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("accounts", {
      id: {
        type: Sequelize.TEXT,
      },
      type: { type: Sequelize.TEXT },
      provider: { type: Sequelize.TEXT },
      provider_account_id: { type: Sequelize.TEXT },
      refresh_token: { type: Sequelize.TEXT },
      access_token: { type: Sequelize.TEXT },
      expires_at: { type: Sequelize.INTEGER },
      token_type: { type: Sequelize.TEXT },
      scope: { type: Sequelize.TEXT },
      id_token: { type: Sequelize.TEXT },
      session_state: { type: Sequelize.TEXT },
      user_id: { type: Sequelize.TEXT },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("accounts");
  },
};
