const db = require("./banco")

const Loja = db.sequelize.define("loja",{
    nome:{
        type: db.Sequelize.STRING
    },
    marca:{
        type: db.Sequelize.STRING
    },
    modelo:{
        type: db.Sequelize.STRING
    },
    descricao:{
        type: db.Sequelize.TEXT
    },
    palavras_chave:{
        type: db.Sequelize.TEXT
    }
})

//Loja.sync({force: true})

module.exports = Loja