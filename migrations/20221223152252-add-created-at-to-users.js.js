"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "createdAt", {
      defaultValue: Sequelize.fn("now"),
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("users", "updatedAt", {
      defaultValue: Sequelize.fn("now"),
      allowNull: false,
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "createdAt");
    await queryInterface.removeColumn("users", "updatedAt");
  },
};
