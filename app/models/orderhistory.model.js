const OrderhistoryModel = (sequelize, Sequelize) => {
    const Orderhistory = sequelize.define('Orderhistory', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: Sequelize.STRING, allowNull: true },
        name: { type: Sequelize.STRING, allowNull: true },
        checkindate: { type: 'Timestamp', allowNull: true },
        checkintime: { type: Sequelize.TIME, allowNull: true },
        checkoutdate: { type: 'Timestamp', allowNull: true },
        checkouttime: { type: Sequelize.TIME, allowNull: true },
        price: { type: Sequelize.STRING, allowNull: true },
        discount: { type: Sequelize.STRING, allowNull: true },
        advancepaid: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.INTEGER, defaultValue: 1 },
        maxcanceldate: { type: 'Timestamp', allowNull: true },
        canceleddate: { type: Sequelize.DATE, allowNull: true },
        cancelationfee: { type: Sequelize.STRING, allowNull: true }
    })

    return Orderhistory
}

module.exports = OrderhistoryModel