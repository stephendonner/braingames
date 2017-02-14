/* define welcome message block */
var welcome_block = {
    type: "text",
    text: "Welcome to the experiment. Press any key to begin."
};

/* define instructions block */
var instructions_block = {
    type: "text",
    text: "<p>In this experiment, a circle will appear in the center " +
        "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
        "press the letter F on the keyboard as fast as you can.</p>" +
        "<p>If the circle is <strong>orange</strong>, do not press " +
        "any key.</p>" +
        "<div class='left center-content'><img src='{{ gamestatic('img/blue.png') }}'></img>" +
        "<p class='small'><strong>Press the F key</strong></p></div>" +
        "<div class='right center-content'><img src='{{ gamestatic('img/orange.png') }}'></img>" +
        "<p class='small'><strong>Do not press a key</strong></p></div>" +
        "<p>Press any key to begin.</p>",
    timing_post_trial: 2000
};

/* define test block */

var test_stimuli = [
    {
        stimulus: "{{ gamestatic('img/blue.png') }}",
        data: { response: 'go' }
    },
    {
        stimulus: "{{ gamestatic('img/orange.png') }}",
        data: { response: 'no-go' }
    }
];

var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);

var post_trial_gap = function() {
    return Math.floor( Math.random() * 1500 ) + 750;
};

var test_block = {
    type: "single-stim",
    choices: ['F'],
    timing_response: 500,
    timing_post_trial: post_trial_gap,
    on_finish: function(data){
        var correct = false;
        if(data.response == 'go' && data.rt > -1){
            correct = true;
        } else if(data.response == 'no-go' && data.rt == -1){
            correct = true;
        }
        jsPsych.data.addDataToLastTrial({correct: correct});
    },
    timeline: all_trials
};

/* define debrief block */

function getSubjectData() {

    var trials = jsPsych.data.getTrialsOfType('single-stim');

    var sum_rt = 0;
    var correct_trial_count = 0;
    var correct_rt_count = 0;
    for (var i = 0; i < trials.length; i++) {
        if (trials[i].correct == true) {
            correct_trial_count++;
            if(trials[i].rt > -1){
                sum_rt += trials[i].rt;
                correct_rt_count++;
            }
        }
    }
    return {
        rt: Math.floor(sum_rt / correct_rt_count),
        accuracy: Math.floor(correct_trial_count / trials.length * 100)
    };
}

var debrief_block = {
    type: "text",
    text: function() {
        var subject_data = getSubjectData();
        return "<p>You responded correctly on "+subject_data.accuracy+"% of "+
            "the trials.</p><p>Your average response time was <strong>" +
            subject_data.rt + "ms</strong>. Press any key to complete the "+
            "experiment. Thank you!</p>";
    }
};

/* create experiment timeline array */
var timeline = [];
timeline.push(welcome_block);
timeline.push(instructions_block);
timeline.push(test_block);
timeline.push(debrief_block);

/* start the experiment */
var csrf = "{% csrf_token %}";
jsPsych.init({
    timeline: timeline,
    // Uncomment to send and store data
    on_finish: function() {
        $.ajax({
            type: 'post',
            cache: false,
            url: 'datacollector/',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                'X-CSRFToken': '{{  csrf_token }}'
            },
            data: jsPsych.data.dataAsJSON(),
            success: function(output) { console.log(output); }
        });
    }
});
