// eslint-disable-next-line no-unused-vars
function replaceForm() {
    const passwordResetForm = `<form id="login-form" class="login-form-1" method="POST" onsubmit="return notify()">

                                    <div class="input-group py-1">
                                        <label for="lg_email" class="sr-only">Email</label>
                                        <input type="text" class="form-control" id="lg_email" name="email"
                                            placeholder="Email" maxlength="190" required>
                                    </div>

                                    <div class="submit-button-container text-center mt-4">
                                        <input type="submit" class="btn mt-2 submit-button px-4" value="SUBMIT"/>
                                    </div>

                                    <div class="text-center form-message mt-3">
                                        Haven't been here before? <a href="/auth/register">Sign up</a>.
                                    </div>
                                </form>`;

    const cardTitle = '<div class="card-title"><strong>FORGOT PASSWORD</strong></div>';
    $('.card-title').replaceWith(cardTitle);
    $('#login-form').replaceWith(passwordResetForm);
}

// eslint-disable-next-line no-unused-vars
function notify() {
    const email = $('#lg_email').val();
    let message = '';
    let cardTitle = '';
    $.ajax({
        url: '/recovery/forgotPassword',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: $('input[name="email"]').val(),
        }),
    })
        .done((_response) => {
            message = `<div class="text-center form-message mt-3">
                        We have emailed password-reset instructions to<br>
                        <a href="mailto:${email}" style="color: #0381ff; font-size: 2rem;">${email}</a>.<br><br>
                        Need help? <a href="mailto:askcsivit@gmail.com">Contact us</a>.
                    </div>`;

            cardTitle = '<div class="card-title"><strong>CHECK YOUR EMAIL</strong></div>';
            $('.card-title').replaceWith(cardTitle);
            $('.card-body').replaceWith(message);
        }).fail(() => {
            message = `<div class="text-center form-message mt-3">
                        Server Error.
                    </div>`;

            cardTitle = '<div class="card-title"><strong>ERROR</strong></div>';
            $('.card-title').replaceWith(cardTitle);
            $('.card-body').replaceWith(message);
        });
    return false;
}

function onSubmit(token) {
    $.ajax({
        url: '/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            username: $('input[name="username"]').val(),
            password: $('input[name="password"]').val(),
            grecaptcha_token: token,
        }),
    })
        .done((response) => {
            if (response.success) {
                if (response.redirect !== '') {
                    window.location.href = response.redirect;
                } else {
                    window.location.href = '/';
                }
            } else if (!response.success && response.message === 'incorrectDetails') {
                $('.submit-failure').html('You entered an incorrect Username/RegNo or Password.').show();
            } else if (!response.success && response.message === 'recaptchaFailed') {
                $('.submit-failure').html('Google Recaptcha verification failed. Try again.').show();
            } else if (!response.success && response.message === 'notVerified') {
                $('.submit-failure').html('Please verify your account using the verification link we sent to your registered email to login.').show();
            } else {
                $('.submit-failure').html('An unknown error has occured.').show();
            }
        })
        .fail(() => {
            $('.submit-failure').html('An unknown error has occured.').show();
        });

    // eslint-disable-next-line no-undef
    grecaptcha.reset();
}

$(() => {
    $('#login-form').submit(() => {
        // eslint-disable-next-line no-undef
        grecaptcha.execute();
        return false;
    });
});
