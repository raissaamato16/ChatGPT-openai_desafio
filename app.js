const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const post = require("./models/post")
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

app.engine("handlebars", handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", function (req, res) {
    res.render("index")
})

app.post("/cadastrar", async function (req, res) {
    const nome = req.body.nome;
    const marca = req.body.marca;
    const modelo = req.body.modelo;

    const descricao = await gerarDescricao(nome, marca, modelo);
    const palavras_chave = await gerarPalavrasChave(nome, marca, modelo);
    const palavras_chave_string = palavras_chave.join('\n\n');

    post.create({
        nome: nome,
        marca: marca,
        modelo: modelo,
        descricao: descricao,
        palavras_chave:  palavras_chave_string,
    }).then(function () {
        res.redirect("/")
    }).catch(function (erro) {
        res.send("Falha ao cadastrar os dados: " + erro)
    })
})

async function gerarDescricao(nome, marca, modelo) {
    const prompt = `Produto: ${nome}, ${marca}, ${modelo}\nGerar descrição de como é o produto de forma bem resumida em 50 palavras:`;
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 500,
    });

    return response.data.choices[0].text;
}

async function gerarPalavrasChave(nome, marca, modelo) {
    const prompt = `Produto: ${nome}, ${marca}, ${modelo}\nGerar 100 palavras-chave curtas, numeradas:`;
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1500,
    });
    return response.data.choices[0].text.split("\n");
}

app.get("/consulta", function (req, res) {
    post.findAll().then(function (lojas) {
        res.render("consulta", { post: lojas })
    }).catch(function (erro) {
        console.log("Erro ao carregar dados do banco: " + erro)
    })
})

app.listen(8081, function () {
    console.log("Servidor ativo!")
})