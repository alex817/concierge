from concierge.config import FCBookerConfig, read_login_info
from concierge.fc_booker import FCBooker

from datetime import datetime


def main():
    selected_timeslots = {'19:00', '20:00', '21:00'}
    selected_weekdays = {0, 1, 2, 3, 4}
    fc_booker = FCBooker(FCBookerConfig.from_cli())
    for date in fc_booker.get_dates():
        weekday = datetime(int(date[:4]), int(date[4:6]), int(date[6:])).weekday()
        if weekday not in selected_weekdays:
            print(f'skipping date: {date}. reason: not in selected weekdays: {selected_weekdays}')
            continue
        avail_courts = fc_booker.get_avail_courts(date, selected_timeslots)
        if avail_courts:
            print(date)
            print(avail_courts)
        else:
            print(f'not available court on {date}')


if __name__ == '__main__':
    main()
