import pandas as pd
import numpy as np
# from scipy import stats
from sklearn import linear_model
from functools import reduce
# import matplotlib.pyplot as plt
import time


def prediction(data):
    # Read JSON data into Pandas DataFrame
    df = pd.DataFrame.from_dict(data)
    # Task
    # normalize data
    indeterminate = df.groupby('date').feature.mean().reset_index()
    y = indeterminate['feature']
    X = indeterminate['date']
    # (X, y) = reject_outliers(X, y)
    X = X.values.reshape(-1, 1)
    # create linear regression model
    regr = linear_model.LinearRegression()
    regr.fit(X, y)
    # Prediction Data
    # y_predict = list(map(lambda x: x * regr.coef_ + regr.intercept_, X))
    # # graph plotting commands
    # plt.scatter(X, y)
    # plt.plot(X, y_predict, 'm')
    # plt.show()

    return X[-1] * regr.coef_ + regr.intercept_

# def reject_outliers(timestamp, data, m=2):
#     z = np.abs(stats.zscore(data))
#     for x in range(len(data)):
#         if z[x] >= m:
#             timestamp.pop(x)
#             data.pop(x)
#     return timestamp, data
