module.exports = {
    config: {
        host: '127.0.0.1',
        port: '3306',
    database: 'jezsel',
    user: 'root',
    password: '',
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

    // config: {
    //     // host: '127.0.0.1',
    //     host: '23.106.120.170',
    //     port: '3306',
    //     database: 'jezsel_jezsel',
    //     user: 'jezsel_jezsel',
    //     password: 'jezsel_jezsel',
    //     dialect: "mysql",
    //     pool: {
    //         max: 5,
    //         min: 0,
    //         acquire: 30000,
    //         idle: 10000
    //     }
    // }
}