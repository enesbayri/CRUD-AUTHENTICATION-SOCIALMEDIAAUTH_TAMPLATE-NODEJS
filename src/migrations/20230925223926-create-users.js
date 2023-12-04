'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ad: {
        type: Sequelize.STRING
      },
      soyad: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique:true,
      },
      sifre: {
        type: Sequelize.STRING
      },
      emailaktif: {
        type: Sequelize.BOOLEAN,
        defaultValue:false,
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue:"https://sanliurfacekici.net/public/uploads/footerLogo.png",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};