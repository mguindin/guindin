$(document).ready(function() {
    $('#lunchInput').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            cuisine: {
                container: '#cuisineMessage',
                validators: {
                    notEmpty: {
                        message: 'Cuisine is required (if you\'re unsure of what to eat, choose random)'
                    }
                }
            },
            radius: {
                container: '#radiusMessage',
                validators: {
                    notEmpty: {
                        message: 'Radius required (in miles)'
                    },
                    numeric: {
                        message: 'Radius must be a number'
                    }
                }
            }
        }
    });
});