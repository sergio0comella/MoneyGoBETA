(function () {
    var mainview = {};
    var maincontrol = {};
    var cifra_validata = false;

    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });
    $("#RicaricaConto").on("click", function (){maincontrol.premutoRicarica()});

    maincontrol.verificaNick = function(){
        $.ajax({
            type: "GET",
            url: "/home/user_nickname",

            success: function (data) {
                maincontrol.user_nickname = data;
            },
            error: function () {
                mainview.mostraAlert("Qualcosa è andato storto.");
            }

        })
    };

    maincontrol.premutoRicarica = function(){
        if(cifra_validata) {
            var destinatario = maincontrol.user_nickname;
            var importo = $("#importoRic").val().replace(/\./g, '');
            importo = importo.replace(/,/g, '.');
            var metodo = $("#listaCarte option:selected").val()
            console.log(metodo);
            $.ajax({
                type: "POST",
                url: "/home/inviaDenaro",
                data: {destinatario: destinatario, importo: importo, metodo: metodo, causale: "ricarica conto", bypass: "on"},

                success: function (msg) {
                    if(msg === "DONE"){
                        $("#successAlert").show();
                        $("#alert_text_success").text("Ricarica eseguita con successo")
                    }
                    else if(msg === "TRANERR"){
                        $("#alert").show();
                        $("#alert_text").text("Ricarica fallita, riprova")
                    }
                    else if(msg === "FAULT"){
                        $("#alert").show();
                        $("#alert_text").text("Ricarica fallita, riprova")
                    }
                    else if(msg === "TOO"){
                        $("#alert").show();
                        $("#alert_text").text("L'importo selezionato non è coperto dal metodo scelto")
                    }
                },
                error: function () {
                    console.log("fallito");
                }
            });
        }
    };


$(document).ready(function () {
    maincontrol.verificaNick();


    $("#importoRic").change(function () {
        var cifra = 0;
        cifra = $("#importoRic").val();
        if(cifra !== "" && !isNaN(cifra)) {
            $("#importoRic").val(formatter.format(cifra));
            cifra_validata = true;
            return;
        }else{
            cifra_validata = false;
        }
    });
});

})();
