from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split


def prediction(data, target):

    (training_data, validation_data, training_labels, validation_labels) = train_test_split(
        data, target, test_size=0.2, random_state=100)

    accuracies = []
    for k in range(1, 40):
        classifier = KNeighborsClassifier(n_neighbors=k)
        classifier.fit(training_data, training_labels)
        accuracies.append(classifier.score(validation_data, validation_labels))

    k = max(accuracies)
    classifier = KNeighborsClassifier(n_neighbors=k)
    return classifier.predict(target)
