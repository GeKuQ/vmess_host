# coding: utf-8
import urllib.request
import ssl


def main():
    ssl._create_default_https_context = ssl._create_unverified_context
    r = urllib.request.urlopen('https://google.com')
    print(r.status)
    print(r)


if __name__ == '__main__':
    main()