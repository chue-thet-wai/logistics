export const calculateLastDate = (startDate, freeDays) => {
    if (!startDate || !freeDays) return null;

    const date = new Date(startDate);
    date.setDate(date.getDate() + Number(freeDays) - 1);

    return date.toISOString().split("T")[0];
};

export const calculateContainerCharges = (item) => {
    const today = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    let demurrage_last_date = null;
    let detention_last_date = null;

    /* DEMURRAGE */
    if (item.arrival_date) {
        const start = new Date(item.arrival_date);
        const end = item.left_port_date ? new Date(item.left_port_date) : today;

        const freeDays = Number(item.demurrage_free_day) || 0;

        demurrage_last_date = calculateLastDate(item.arrival_date, freeDays);

        const usedDays = Math.floor((end - start) / MS_PER_DAY) + 1;

        item.demurrage_used_day = Math.max(0, usedDays);
        item.demurrage_extra_day = Math.max(0, usedDays - freeDays);
    }

    /* DETENTION */
    if (item.left_port_date) {
        const start = new Date(item.left_port_date);
        const end = item.container_return_date ? new Date(item.container_return_date) : today;

        const freeDays = Number(item.detention_free_day) || 0;

        detention_last_date = calculateLastDate(item.left_port_date, freeDays);

        const usedDays = Math.floor((end - start) / MS_PER_DAY) + 1;

        item.detention_used_day = Math.max(0, usedDays);
        item.detention_extra_day = Math.max(0, usedDays - freeDays);
    }

    return {
        ...item,
        demurrage_last_date,
        detention_last_date
    };
};