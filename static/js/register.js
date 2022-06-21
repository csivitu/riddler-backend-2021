function isChecked(checkboxId) {
    return $(checkboxId)[0].checked;
}

const regexes = {
    vitEmailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((vitstudent.ac.in)|(vit.ac.in))$/,
    emailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    mobileRegex: /[\s\S]*/, // match anything because i gave up coming up with a generic regex
    passwordRegex: /^[a-zA-Z0-9`!@#$%^&*()-/:'.,{}_"~]{8,50}$/, // 8-50 characters,
    regNoRegex: /^\d\d[A-Z]{3}[0-9]{4}$/,
    usernameRegex: /^[a-zA-Z0-9`!@#$%^&*()-/:'.,{}_"~]{3,20}$/,
};


class InputField {
    constructor(name, regex, message) {
        this.name = name;
        this.element = $(`input[name="${name}"]`);
        this.regex = regex;
        this.message = message;
        this.errorElem = $(`<div class="input-group-append" data-container="form" data-toggle="popover" data-placement="top" data-content="${this.message}">
                                <div class="input-group-text"><i class="fas fa-exclamation-circle"></i></div>
                            </div>`);
        $('body').append(this.popperElem);
        this.element.after(this.errorElem);

        this.errorElem.popover({
            container: 'form',
            trigger: 'hover',
        });

        this.errorElem.hide();
        this.element.on('input', () => {
            this.validate();
        });
    }

    validate() {
        if (this.name === 'email') {
            if (isChecked($('#lg_vitian'))) {
                this.regex = regexes.vitEmailRegex;
            } else {
                this.regex = regexes.emailRegex;
            }
        } else if (this.name === 'regNo') {
            if (!isChecked($('#lg_vitian'))) {
                return true;
            }
        }
        if (!this.regex.test(this.element.val())) {
            this.errorElem.show();
            return false;
        }
        this.errorElem.hide();
        return true;
    }
}

function registrationSuccess(email, redirectUrl, redirectClient) {
    let redirectMessage = '';

    if (redirectUrl) {
        redirectMessage = `You will be redirected back to ${redirectClient} in 5 seconds <br><br>`;
    }
    const message = `<div class="text-center form-message mt-3">
                        You have registered successfully! Please verify your email, we have sent you a mail at<br>
                        <a href="mailto:${email}" style="color: #0381ff; font-size: 2rem;">${email}</a>.<br><br>
                        ${redirectMessage}
                        Need help? <a href="mailto:askcsivit@gmail.com">Contact us</a>.
                    </div>`;

    const cardTitle = '<div class="card-title"><strong>Your CSI Account has been created!</strong></div>';

    $('.card-title').replaceWith(cardTitle);
    $('.card-body').replaceWith(message);

    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 5000);
    }
}

const fieldObjs = {};

function onSubmit(token) {
    const userEmail = $('input[name="email"]').val();

    $.ajax({
        url: '/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            name: $('input[name="name"]').val(),
            username: $('input[name="username"]').val(),
            password: $('input[name="password"]').val(),
            mobile: $('input[name="mobile"]').val(),
            isVitian: $('input[name="isVitian"]')[0].checked,
            regNo: $('input[name="regNo"]').val(),
            email: userEmail,
            gender: $('input[name="gender"]:checked').val(),
            grecaptcha_token: token,
        }),
    })
        .done((response) => {
            if (response.success && response.message === 'registrationSuccess') {
                registrationSuccess(userEmail, response.redirect, response.redirectClient);
            } else if (response.message === 'duplicate') {
                if (!response.duplicates) {
                    $('.submit-failure').html('An unknown error has occured.').show();
                    return;
                }

                let content = '';
                let i = 0;

                for (; i < response.duplicates.length - 1; i += 1) {
                    content += `${response.duplicates[i]}, `;
                }
                content += `${response.duplicates[i]} already exists.`;
                $('.submit-failure').html(content).show();
            } else if (response.message === 'recaptchaFailed') {
                $('.submit-failure').html('Google Recaptcha verification failed. Try again.').show();
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
    const fields = [{
        name: 'email',
        regex: regexes.emailRegex,
        message: 'Invalid Email.',
    }, {
        name: 'mobile',
        regex: regexes.mobileRegex,
        message: 'Invalid Mobile.',
    }, {
        name: 'password',
        regex: regexes.passwordRegex,
        message: 'Invalid Password. Password must have 8-50 characters.',
    }, {
        name: 'regNo',
        regex: regexes.regNoRegex,
        message: 'Invalid Registration Number.',
    }, {
        name: 'username',
        regex: regexes.usernameRegex,
        message: 'Invalid Username. Username should contain atleast 3 characters.',
    }];

    fields.forEach((field) => {
        fieldObjs[field.name] = new InputField(field.name, field.regex, field.message);
    });

    $('#login-form').submit(() => {
        $('.submit-failure').hide();
        const keys = Object.keys(fieldObjs);
        for (let i = 0; i < keys.length; i += 1) {
            if (!fieldObjs[keys[i]].validate()) {
                $('.submit-failure').html('Please correct the invalid fields.').show();
                return false;
            }
        }
        // eslint-disable-next-line no-undef
        grecaptcha.execute();
        return false;
    });

    $('#lg_vitian').change((event) => {
        fieldObjs.email.validate();
        if (isChecked(event.currentTarget)) {
            $('.hide-group').slideDown();
            $('#lg_email').fadeOut(() => {
                $('#lg_email').attr('placeholder', 'VIT Email-ID');
                $('#lg_email').fadeIn();
            });
            $('#lg_regno').attr('required', true);
        } else {
            $('#lg_email').fadeOut(() => {
                $('#lg_email').attr('placeholder', 'Email-ID');
                $('#lg_email').fadeIn();
            });
            $('.hide-group').slideUp();
            $('#lg_regno').removeAttr('required');
        }
    });

    $('input[name="regNo"]').keyup((event) => {
        $(event.currentTarget).val($(event.currentTarget).val().toUpperCase());
    });
});
