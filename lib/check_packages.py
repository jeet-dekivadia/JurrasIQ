try:
    import pandas
    import numpy
    import sklearn
    print('OK')
except ImportError as e:
    print(f'Missing package: {str(e)}')
    exit(1) 