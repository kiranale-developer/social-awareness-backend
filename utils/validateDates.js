const validateDates = (start_date, end_date) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();

    // remove time part for accurate comparison
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        return { valid: false, message: "Start date cannot be in the past" };
    }

    if (end <= start) {
        return { valid: false, message: "End date must be after start date" };
    }

    return { valid: true };
};

export default validateDates;