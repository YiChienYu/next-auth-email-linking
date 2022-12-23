"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("verification_tokens", {
      token: {
        type: Sequelize.TEXT,
      },
      identifier: { type: Sequelize.TEXT },
      expires: { type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("verification_tokens");
  },
};
