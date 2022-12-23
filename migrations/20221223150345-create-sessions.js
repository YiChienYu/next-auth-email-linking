"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sessions", {
      id: {
        type: Sequelize.TEXT,
      },
      expires: { type: Sequelize.DATE },
      session_token: { type: Sequelize.TEXT },
      user_id: { type: Sequelize.TEXT },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sessions");
  },
};
