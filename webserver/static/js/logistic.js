
/**
 * Logistic growth curve function.
 * @param MAX: maximum value of the function (the numerator).
 * @param T_INF: the time of the inflection point - when does the curve start to change direction?
 * @param T_RISE: the time for the curve to reach the inflection point
 * @param LIN: this parameter was added to model social distancing:
 * the time to reach the inflection point will increase over time,
 * as the disease is spreading more slowly.
 * @author Michael Fatemi, Fredrik Fatemi
*/
function logisticFunction([MAX, T_INF, T_RISE, LIN]) {
    return t => (MAX / (1 + Math.exp(-(t - T_INF)/(T_RISE + LIN * t))));
}

function stringsToDates(entryDateStrings) {
    return entryDateStrings.map(x => new Date(x));
}

/**
 * Converts a list of dates into a list of numbers, representing the number
 * of days since Day 1.
 * Assumes the dates are *sorted*.
 * @author Michael Fatemi
 * @param entryDates The list of dates to convert into indexed numbers.
 * @returns A list of numbers, 0-indexed based on the start date.
 */
function datesToNumbers(entryDates) {
    let minDate = entryDates[0];
    let dateLength = 86400 * 1000;
    return entryDates.map(x => (x.getTime() - minDate.getTime()) / dateLength);
}

/**
 * Logistic regression!
 * @param x The x values (dates)
 * @param y The y values (total cases, total deaths, etc.)
 * @returns The parameters for a logistic regression that fit these stats.
 * @author Michael Fatemi, Fredrik Fatemi
 */
function fit(x, y) {
    let data = {
        x: x,
        y: y
    };

    // Order: MAX, T_INF, T_RISE, LIN
    let minValues = [
        y[y.length - 1], // max: must be at least the highest date seen
        0,	// t_inf: must be at least the starting date
        1,	// t_rise: must be at least 1 day (to avoid exponential overflow)
        0   // lin: must be at least 0 (social distancing shouldn't decrease)
    ];
        
    let maxValues = [
        7.3e9, // world population
        800, // upper bound for T_INF
        800, // upper bound for T_RISE
        0
    ];

	let startingValues = [
        y[y.length - 1], // max: starts at highest value
        x[Math.floor(x.length/2)], // t_inf: starts at middle value
        40, // t_rise: starts at 40 days
        0 // lin: starts at a slope of one day per day
    ];

    let options = {
        damping: 1,
        initialValues: startingValues,
        minValues: minValues,
        maxValues: maxValues,
        maxIterations: 100,
        errorTolerance: 0
    };

    let fittedParams = LM(data, logisticFunction, options);
    return fittedParams;
}
