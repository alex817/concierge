import os

from argparse import ArgumentParser
from dataclasses import dataclass
from typing import List, Optional
from yaml import SafeLoader, load

@dataclass
class FCBookerConfig:

    user: str
    password: str
    base_url: str = 'https://www.hkfc.com'
    facility: str = 'TEN'

    @staticmethod
    def get_parser():
        parser = ArgumentParser()
        parser.add_argument('-u', '--user', required=True)
        parser.add_argument('-p', '--password', required=True)
        parser.add_argument('-bu', '--base-url', default='https://www.hkfc.com')
        return parser

    @classmethod
    def from_cli(cls, arg_list: Optional[List[str]] = None):
        parser = cls.get_parser()
        if arg_list:
            args = parser.parse_args(arg_list)
        else:
            args = parser.parse_args()
        return cls(args.user, args.password, args.base_url)


def read_login_info():
    file_path = os.path.join(os.path.dirname(__file__), 'resources', 'login.yaml')
    with open(file_path) as f:
        return load(f, SafeLoader)
