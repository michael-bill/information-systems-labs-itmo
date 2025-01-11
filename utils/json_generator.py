import json
import random
import string
from datetime import datetime, timedelta

def generate_random_string(length):
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

def generate_random_date():
    # 2025-01-10T16:46:23.484Z
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2026, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    return random_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def generate_house_data(num_elements):
    data = []
    for _ in range(num_elements):
        item = {
            "name": generate_random_string(10),
            "year": random.randint(1, 552),
            "numberOfFlatsOnFloor": random.randint(1, 10)
        }
        data.append(item)
    return data

def generate_flat_data(num_elements):
    data = []
    for _ in range(num_elements):
        item = {
            "name": generate_random_string(10),
            "coordinates": {
                "x": round(random.uniform(0, 1000), 2),
                "y": round(random.uniform(0, 1000), 2)
            },
            "creationDate": generate_random_date(),
            "area": round(random.uniform(10, 150), 2),
            "price": round(random.uniform(100_000, 1_000_000), 2),
            "balcony": random.choice([True, False]),
            "timeToMetroOnFoot": random.randint(1, 60),
            "numberOfRooms": random.randint(1, 7),
            "numberOfBathrooms": random.randint(1, 10),
            "timeToMetroByTransport": random.randint(1, 30),
            "view": random.choice(["STREET", "BAD", "NORMAL", "TERRIBLE"]),
            "houseId": 1
        }
        data.append(item)
    return data

def save_to_file(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

num_elements = 1_000

generated_house_data = generate_house_data(num_elements)
filename = "generated_house_data.json"
save_to_file(generated_house_data, filename)

generated_flat_data = generate_flat_data(num_elements)
filename = "generated_flat_data.json"
save_to_file(generated_flat_data, filename)
