"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.TEXT,
      },
      name: { type: Sequelize.TEXT },
      email: { type: Sequelize.TEXT },
      emailVerified: { type: Sequelize.DATE },
      image: { type: Sequelize.TEXT },
      member_id: { type: Sequelize.INTEGER },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
