const express = require('express');
const router = express.Router();
const Metodi = require('../controller/metodi');
const Conto = require('../controller/conto');

const metodi = new Metodi();
const conto = new Conto();

router.get('/adminCards', (req,res,next) =>{
    let user = req.session.user;
    if(!user){
        res.redirect('/');
        return
    }
    metodi.recuperaMetodi(user.nickname, function (result) {
        if (result) {
            req.session.metodi = result;
            metodi.recuperaDatiCarte(user.nickname, function (resCarte) {
                if (resCarte) {
                    req.session.carte = resCarte;
                    metodi.recuperaDatiBanca(user.nickname, function (resBanca) {
                        req.session.banca = resBanca;
                        res.render('gestione-carte', {
                            metodi: req.session.metodi,
                            carte: req.session.carte,
                            banca: req.session.banca
                        });
                    })
                }
            })
        } else console.log("Errore recupero metodi");
    })

});

router.get('/gestioneProfilo', (req,res,next) =>{
    if(!req.session.user){
        res.redirect('/');
        return
    }
    let nickname = req.session.user.nickname;
    conto.recuperaLimiteSpesa(nickname, function (result) {
        if (result) {
            req.session.limite_spesa = result;
            res.render('gestioneprofilo', {title: "MoneyGo", user: req.session.user, limite: req.session.limite_spesa});
        }
    });
});


module.exports = router;
