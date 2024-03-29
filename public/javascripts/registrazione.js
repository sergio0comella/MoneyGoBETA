(function () {
    var mainview = {};
    var maincontrol = {};

    /* Variabili ausiliarie per la gestione dei controlli sugli input dell'utente. */
    var nome_validato = false;
    var cognome_validato = false;
    var codicefiscale_validato = false;
    var data_di_nascita_validata = false;
    var telefono_validato = false;
    var email_validata = false;
    var nickname_validato = false;
    var password_validata = false;
    var conferma_password_validata = false;
    var iva_validata = false;

    $("#form_registrati").submit(function(e){maincontrol.premutoRegistrati(e)});
    $("#accessoButton").on('click', function(e){maincontrol.registrazioneCompletata(e)});

    maincontrol.premutoRegistrati = function (e) {
        e.preventDefault();

        var inputs = $('input[type=text],#password,#nascita,#email');
        var utente = {};

        for (let i = 0; i < inputs.length; i++) {
            utente[inputs[i].id] = inputs[i].value;
        }
        if(nome_validato && cognome_validato && data_di_nascita_validata &&
            telefono_validato && email_validata && nickname_validato && password_validata && conferma_password_validata && (codicefiscale_validato || iva_validata)) {
            $.ajax({
                type: "POST",
                url: "/registrati/inviaRegistrazione",
                data: utente,

                success: function (msg) {
                    if (msg === "ADDUSER") {
                        mainview.showModal();
                        console.log("CIAO");
                        //maincontrol.registrazioneCompletata(utente.nickname, utente.password);
                    }
                },
                error: function (msg) {
                    console.log("ERRORE" + msg);
                }
            })
        }else{
            mainview.FaultRegistrati();
        }
    };

    maincontrol.redirectHome = function() {
        location.href = '/home';
    };

    maincontrol.registrazioneCompletata = function(e){
        var user = $("#nickname").val();
        var password = $("#password").val();
        e.preventDefault();
        //effettua il login
        $.ajax({
            type: "POST",
            url: "/login",
            data: {user: user, password: password},

            success: function(msg) {
                console.log("Accesso eseguito" + msg);
                maincontrol.redirectHome();
            }
        })
    };

    maincontrol.controllaMailDuplicata = function(email){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaEmailUnica",
            data: {email: email},

            success: function (msg) {
                if(msg === "EXIST"){
                    email_validata=false;
                    mainview.campoEsistente("Email già presente nel sistema");
                    $("#email").addClass("is-invalid");
                }else if (msg === "NOTEXIST"){
                    email_validata=true;
                    mainview.ripulisciCampiErrati();
                }
            }
        })
    };

    maincontrol.controllaNicknameDuplicato = function(nickname){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaNick",
            data: {nick: nickname},

            success: function (msg) {
                console.log(msg);
                if(msg === "EXIST"){
                    nickname_validato=false;
                    mainview.campoEsistente("Nickname già presente nel sistema");
                    $("#nickname").addClass("is-invalid");
                }else if (msg === "NOTEXIST"){
                    nickname_validato=true;
                    mainview.ripulisciCampiErrati();
                }
            }
        })
    };

    maincontrol.codiceDuplicato = function(codice, tipo){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaCodice",
            data: {codice: codice},

            success: function (msg) {
                console.log(msg);
                if(msg === "EXIST"){
                    if(tipo === "fiscale") {
                        mainview.campoEsistente("Codice Fiscale già presente nel sistema");
                        codicefiscale_validato = false;
                        $("#codicefiscale").addClass("is-invalid");
                    }else if(tipo === "iva"){
                        mainview.campoEsistente("Partita Iva già presente nel sistema");
                        iva_validata = false;
                        $("#piva").addClass("is-invalid");
                    }
                }else if (msg === "NOTEXIST"){
                    if(tipo === "fiscale") {
                        codicefiscale_validato = true;
                        mainview.ripulisciCampiErrati($("#codicefiscale"));
                    }else if(tipo === "iva"){
                        iva_validata = true;
                        mainview.ripulisciCampiErrati($("#piva"));
                    }
                }
            }
        })

    };


    mainview.showModal = function(){
        $("#modalSuccess").modal('show');
    };

    mainview.campoEsistente = function(msg){
        $("#alert_text").text(msg);
        $("#alert").show("slow");
    };

    mainview.campiErrati = function (id) {
        $("#alert_text").text("Per favore, ricontrollare i dati");
        $("#alert").show("slow");
       id.addClass("is-invalid");
       id.removeClass("is-valid");
    };

    mainview.campiVuoti = function(id){
        id.removeClass("is-invalid");
        id.removeClass("is-valid");
    };

    mainview.FaultRegistrati = function () {
        $("#alert_text").text("Qualcosa non va con i dati inseriti. Per favore, ricontrollare il form.");
        $("#alert").show("slow");
        $("html,body").animate({scrollTop : 0}, "slow");
        return false;

    };

    mainview.ripulisciCampiErrati = function(id){
        $("#alert").hide();
        id.removeClass("is-invalid");
        id.addClass("is-valid");

    };

    mainview.mostraInfoPassword =  function(){
        $("#textCheck").text("La password deve contenere più di 8 caratteri di cui almeno una lettera Maiuscola, una minuscola ed un numero.");
        $("#alertCheck").show();
    };

    mainview.nascondiInfoPassword = function(){
        $("#alertCheck").hide();
    };

    maincontrol.controllaPiva = function(pi){
        if( pi == '' )  return 'blank';
        if( pi.length != 11 )
            return "La lunghezza della partita IVA non è\n" +
                "corretta: la partita IVA dovrebbe essere lunga\n" +
                "esattamente 11 caratteri.\n";
        validi = "0123456789";
        for( i = 0; i < 11; i++ ){
            if( validi.indexOf( pi.charAt(i) ) == -1 )
                return "La partita IVA contiene un carattere non valido `" +
                    pi.charAt(i) + "'.\nI caratteri validi sono le cifre.\n";
        }
        s = 0;
        for( i = 0; i <= 9; i += 2 )
            s += pi.charCodeAt(i) - '0'.charCodeAt(0);
        for( i = 1; i <= 9; i += 2 ){
            c = 2*( pi.charCodeAt(i) - '0'.charCodeAt(0) );
            if( c > 9 )  c = c - 9;
            s += c;
        }
        if( ( 10 - s%10 )%10 != pi.charCodeAt(10) - '0'.charCodeAt(0) )
            return "La partita IVA non è valida:\n" +
                "il codice di controllo non corrisponde.\n";
        return '';
    };

    $(document).ready(function () {
        /*Controllo Nome */
        $( "#nome" ).blur( function () {
            if ($( "#nome" ).val() != "") {
                if (/^[A-Za-z]+$/.test( $( "#nome" ).val() )) {
                    nome_validato = true;
                    mainview.ripulisciCampiErrati( $( "#nome" ) );
                    $( "#nome" ).addClass( "is-valid" );
                    return;
                } else {
                    nome_validato = false;
                    mainview.campiErrati( $( "#nome" ) );
                    $( "#nome" ).addClass( "is-invalid" );

                }
            } else mainview.campiVuoti( $( "#nome" ) );
            nome_validato = false;
        } );

        /*Controllo cognome*/
        $( "#cognome" ).blur( function () {
            if ($( "#cognome" ).val() != "") {
                if (/^[A-Za-z]+$/.test( $( "#cognome" ).val() )) {
                    cognome_validato = true;
                    $( "#cognome" ).addClass( "is-valid" );
                    mainview.ripulisciCampiErrati( $( "#cognome" ) );
                    return;
                } else {
                    cognome_validato = false;
                    $( "#cognome" ).addClass( "is-invalid" );
                    mainview.campiErrati( $( "#cognome" ) );
                }

            } else mainview.campiVuoti( $( "#cognome" ) );
            cognome_validato = false;
        } );

        /* Controllo CF */
        $( "#codicefiscale" ).blur( function () {
            if ($( "#codicefiscale" ).val() != "") {
                if (/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test( $( "#codicefiscale" ).val() )) {
                    codicefiscale_validato = true;
                    mainview.ripulisciCampiErrati( $( "#codicefiscale" ) );
                    maincontrol.codiceDuplicato( $( "#codicefiscale" ).val(), "fiscale" );
                    return;
                } else {
                    codicefiscale_validato = false;
                    mainview.campiErrati( $( "#codicefiscale" ) );
                }
            } else mainview.campiVuoti( $( "#codicefiscale" ) );
            codicefiscale_validato = false;
        } );

        /* Controllo Data di nascita */
        $( "#nascita" ).blur( function () {
            var nascita = $( "#nascita" ).val();
            var d = new Date(); // Data corrente

            // Creo l'oggetto "data di nascita"
            nascita = new Date( nascita );
            /* Se il formato non è valido */
            if (nascita.toDateString() == "Invalid Date") {
                mainview.campiErrati( $( "#nascita" ) );
            }
            /* Se viene dal futuro */
            else if (nascita > d) {
                mainview.campiErrati( $( "#nascita" ) );
            }
            /* Controllo l'età */
            else {
                d.setYear( d.getFullYear() - 14 );
                /* Se ha meno di 14 anni (dalla data di registrazione) */
                if (nascita > d) {
                    mainview.campiErrati( $( "#nascita" ) );
                } else {
                    data_di_nascita_validata = true;
                    mainview.ripulisciCampiErrati( $( "#nascita" ) );
                    return;
                }
            }
            data_di_nascita_validata = false;
        } );

        /*Controllo Email */
        $( "#email" ).blur( function () {
            if ($( "#email" ).val() != "") {
                if (/^[A-Z0-9a-z._-]{3,}@[A-Z0-9a-z.-]{2,}\.[A-Za-z0-9]{2,4}$/.test( $( "#email" ).val() )) {
                    email_validata = true;
                    mainview.ripulisciCampiErrati( $( "#email" ) );
                    maincontrol.controllaMailDuplicata( $( "#email" ).val() );
                    return;
                } else {
                    email_validata = false;
                    mainview.campiErrati( $( "#email" ) );
                }
            } else mainview.campiVuoti( $( "#email" ) );
            email_validata = false;
        } );

        /*Controllo numero di telefono */
        $( "#telefono" ).blur( function () {
            if ($( "#telefono" ).val() != "") {
                if (/^[0-9]{10}$/.test( $( "#telefono" ).val() )) {
                    telefono_validato = true;
                    mainview.ripulisciCampiErrati( $( "#telefono" ) );
                    return;
                } else {
                    telefono_validato = false;
                    mainview.campiErrati( $( "#telefono" ) );
                }
            } else mainview.campiVuoti( $( "#telefono" ) );
            telefono_validato = false;
        } );
        /*Controllo nickname */

        $( "#nickname" ).blur( function () {
            if ($( "#nickname" ).val() != "") {
                if (/^[a-zA-Z0-9]+$/.test( $( "#nickname" ).val() )) {
                    nickname_validato = true;
                    mainview.ripulisciCampiErrati( $( "#nickname" ) );
                    maincontrol.controllaNicknameDuplicato( $( "#nickname" ).val() );
                    return;
                } else {
                    nickname_validato = false;
                    mainview.campiErrati( $( "#nickname" ) );
                }
            } else mainview.campiVuoti( $( "#nickname" ) );
            nickname_validato = false;
        } );


        /* Controllo dell'input per PASSWORD */
        $( "#password" ).focus( function () {
            $( "#password" ).css( "background-color", "white" );
            mainview.mostraInfoPassword();
            if ($( "#password" ).val() == "") {
                $( "#difficolta_password" ).hide();
            }
            $( "#password_errata" ).hide();
        } );

        $( "#password" ).blur( function () {
            mainview.nascondiInfoPassword();
            if (($( "#password" ).val() != "") &&
                ($( "#password" ).val().length >= 8) &&
                (/[0-9]/.test( $( "#password" ).val() )) &&
                (/[a-z]/.test( $( "#password" ).val() )) &&
                (/[A-Z]/.test( $( "#password" ).val() ))) {
                password_validata = true;
            } else {
                password_validata = false;
                $( "#password_errata" ).show();
            }
        } );

        // Gestisco la visualizzazione della difficoltà della password
        $( "#password" ).keyup( function () {
            if (($( "#password" ).val() != "") &&
                ($( "#password" ).val().length >= 8) &&
                (/[0-9]/.test( $( "#password" ).val() )) &&
                (/[a-z]/.test( $( "#password" ).val() )) &&
                (/[A-Z]/.test( $( "#password" ).val() ))) {
                if (($( "#password" ).val().length >= 8) && ($( "#password" ).val().length < 12)) {
                    $( "#password" ).css( "background-color", "rgb(255, 140, 0)" ); // darkorange
                    $( "#gradoPassword" ).text( "Debole" );
                } else if (($( "#password" ).val().length >= 12) && ($( "#password" ).val().length < 16)) {
                    $( "#password" ).css( "background-color", "rgba(255,245,0,0.5)" ); // gold
                    $( "#gradoPassword" ).text( "Media" );
                } else if (($( "#password" ).val().length >= 16)) {
                    $( "#password" ).css( "background-color", "rgba(21,205,2,0.5)" ); // limegreen
                    $( "#gradoPassword" ).text( "Forte" );
                }
            } else {
                $( "#password" ).css( "background-color", "white" ); // limegreen
                $( "#gradoPassword" ).text( " " );
            }
        } );

        /* Controllo dell'input per CONFERMA PASSWORD */
        $( "#conferma_password" ).focus( function () {
            $( "#conferma_errata" ).hide();
        } );

        $( "#conferma_password" ).blur( function () {
            if ($( "#password" ).val().length != 0) {
                if ($( "#conferma_password" ).val() == $( "#password" ).val()) {
                    conferma_password_validata = true;
                    mainview.ripulisciCampiErrati( $( "#conferma_password" ) );
                } else {
                    conferma_password_validata = false;
                    $( "#conferma_errata" ).show();
                    mainview.campiErrati( $( "#conferma_password" ) );
                }
            } else
                conferma_password_validata = false;
        } );
        // Azzero il campo "conferma password" se modifico la password
        $( "#password" ).change( function () {
            conferma_password_validata = false;
            $( "#conferma_password" ).val( "" );
            $( "#conferma_errata" ).hide();
        } );

        $( "#piva" ).blur( function () {
            var ret = maincontrol.controllaPiva( $( "#piva" ).val() );
            if(ret !== ""){
                mainview.campiErrati($("#piva"));
            }else {
                maincontrol.codiceDuplicato( $( "#piva" ).val() , "iva" );
                $( "#piva" ).removeClass( "is-invalid" );
                $( "#piva" ).addClass( "is-valid" );
            }

        } );


        var checkboxes = $( "#utente, #attcomm" );
        $( "#utente" ).prop( "checked", true );
        $( "#attcomm" ).prop( "disabled", true );
        $( "#piva" ).prop( "disabled", true );
        checkboxes.on( 'click', function () {
            checkboxes.prop( "disabled", false );
            $( "#codicefiscale, #piva" ).prop( "disabled", false );

            if ($( "#utente" ).is( ":checked" )) {
                $( "#attcomm" ).prop( "disabled", true );
                $( "#piva" ).prop( "disabled", true );
            } else if ($( "#attcomm" ).is( ":checked" )) {
                $( "#utente" ).prop( "disabled", true );
                $( "#codicefiscale" ).prop( "disabled", true );
            }
        });


    });

})();