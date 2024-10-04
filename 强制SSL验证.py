# coding: utf-8
import urllib.request
import ssl


def main():
    context = ssl._create_unverified_context()
    r = urllib.request.urlopen('https://google.com', context=context)
    print(r.status)
    print(r)


if __name__ == '__main__':
    main()