var checkCredentials = function (){
    let searchParams = new URLSearchParams(window.location.search)
    let hasReservation = searchParams.has('reservation_id') // true
    let hasEmailPhone = searchParams.has('email_or_phone') // true
    let reservationID = searchParams.get('reservation_id')
    let emailPhone = searchParams.get('email_or_phone')

    if(hasReservation && hasEmailPhone){
        $('#reservation-id').val(reservationID);
        $('#email-or-phone').val(emailPhone);
        requestLogin(reservationID, emailPhone);
    }
}

var checkGoogleAuthCode = function (){
    let searchParams = new URLSearchParams(window.location.search)
    let hasCode = searchParams.has('code') // true
    let code = searchParams.get('code')

    if(hasCode){
        console.log(code);
        storeGoogleApiCode(code);
    }
}

function storeGoogleApiCode(code){
    $.ajax({
        type: 'POST',
        url: "/update-google-auth-code",
        data: {
            google_api_code : code
        },
        dataType: 'json',
        success: function(response){
            console.log(response);
        }
    })
}

$(document).on('click', '.left-menu, .left-nav .fa-close', function(){
    $('.left-nav').toggleClass('show');
})

$(document).ready(function(){
    checkCredentials();
    checkGoogleAuthCode();
});

function getUserDataFromCookie(key = null){
    if($.cookie("reservation_data") !== null && (key !== null)){
        return JSON.parse($.cookie("reservation_data"))[key];
    } else if ($.cookie("reservation_data") !== null) {
        return JSON.parse($.cookie("reservation_data"));
    }
}
