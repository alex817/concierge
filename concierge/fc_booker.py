import requests
import re
import logging

from collections import defaultdict
from typing import Set, List, Tuple

from concierge.config import FCBookerConfig

logger = logging.getLogger(__name__)


class FCBooker: 

    def __init__(self, config: FCBookerConfig):
        self.base_url = config.base_url
        self.facility = config.facility
        self.session = self._create_logged_in_session(config.user, config.password)
        self.token = self._get_request_token()

    def _create_logged_in_session(self, user: str, password: str) -> requests.Session:
        session = requests.Session()
        headers = {'Content-type': 'application/x-www-form-urlencoded'}
        session.post(f'{self.base_url}/Umbraco/api/Membership/Login',
                     data={'username': user, 'password': password}, headers=headers)
        return session

    def _get_request_token(self) -> str:
        url = f'{self.base_url}/facilities-booking/booking?facility={self.facility}'
        response = self.session.get(url)
        return re.search('var token = "([0-9a-zA-Z]+)"', response.text).group(1)

    def get_dates(self) -> List[str]:
        url = f'{self.base_url}/facilitiesBooking/avaliableDates/get?Code={self.facility}&token={self.token}'
        response = self.session.get(url)
        return [str(d['DateId']) for d in response.json()['Data']['AvailableDates']]

    def get_avail_courts(self, date: str, selected_timeslots: Set[str]) -> List[Tuple[str, List[int]]]:
        url = f"{self.base_url}/facilitiesBooking/avaliableTime/get?Code={self.facility}&DateId={date}&token={self.token}"
        response = self.session.get(url)
        avail_court_dict = defaultdict(list)
        for timeslot in response.json()['Data']['AvailableTime']:
            if timeslot['TimeSlot'] not in selected_timeslots:
                continue
            for court in timeslot['Courts']:
                if court['Status'] == 'A':
                    avail_court_dict[court['ElementCode']].append(
                        int(timeslot['TimeSlot'].split(':')[0]))
        avail_courts = []
        for court, timeslots in avail_court_dict.items():
            if len(timeslots) < 2:
                break
            prev_timeslot = timeslots[0]
            for timeslot in timeslots[1:]:
                if (timeslot - prev_timeslot) == 1:
                    avail_courts.append((court, timeslots))
        return avail_courts

    def book_court(self, court: str, date: str, timeslot: int) -> bool:
        url = f'{self.base_url}/facilitiesBooking/booking/create'
        headers = {'Content-type': 'application/x-www-form-urlencoded'}
        response = self.session.post(
            url, data=f'code={self.facility}&element={court}&date={date}&time={timeslot}:00&hold=false&token={self.token}', headers=headers)
        return response.status_code == 200
