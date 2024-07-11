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

$(document).on('click', '.left-menu, .left-nav .fa-close', function(){
    $('.left-nav').toggleClass('show');
})

$(document).ready(function(){
    checkCredentials();
});