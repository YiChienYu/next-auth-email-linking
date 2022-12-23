"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("accounts", "createdAt", {
      defaultValue: Sequelize.fn("now"),
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("accounts", "updatedAt", {
      defaultValue: Sequelize.fn("now"),
      allowNull: false,
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("accounts", "createdAt");
    await queryInterface.removeColumn("accounts", "updatedAt");
  },
};
