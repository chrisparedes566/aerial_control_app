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
});

setTimeout(function(){
    checkGoogleAuthCode();
},3000)

function getUserDataFromCookie(key = null){
    if($.cookie("reservation_data") !== null && (key !== null)){
        return JSON.parse($.cookie("reservation_data"))[key];
    } else if ($.cookie("reservation_data") !== null) {
        return JSON.parse($.cookie("reservation_data"));
    }
}

function toggleDashSwitch(elem, path){
    $.ajax({
        type: 'POST',
        url: path,
        dataType: 'json',
        success: function(resultData) {
            console.log(resultData)
            var switchState = resultData.device_params.switch_state;
            if (switchState === 1) {
                elem.addClass( 'off' );
                elem.removeClass( 'on' );
                elem.find('.device-status label').text( 'OFF' );
            } else if (switchState === 0) {
                elem.addClass( 'on' );
                elem.removeClass( 'off' );
                elem.find('.device-status label').text( 'ON' );
            }
        }
    })
}
