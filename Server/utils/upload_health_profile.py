import boto3
import botocore
import time

AWS_CONST = {
    "aws_access_key": "AKIAW3VAO3BXJQKCXCC5",
    "aws_secret_access_key": "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",
    "dynamodb_table_name": "health-profile",
    "region_name": "us-east-1",
}

dynamodb = boto3.client(
    "dynamodb",
    region_name=AWS_CONST["region_name"],
    aws_access_key_id=AWS_CONST["aws_access_key"],
    aws_secret_access_key=AWS_CONST["aws_secret_access_key"],
)


def convert_to_dynamodb_format(data):
    try:
        for key in data.keys():
            val = data[key]
            data[key] = {}
            if type(val) is str:
                data[key]["S"] = val
            elif type(val) is int:
                data[key]["N"] = str(val)
            elif type(val) is list:
                if type(val[0]) is str:
                    data[key]["SS"] = val
                elif type(val[0]) is int:
                    data[key]["NS"] = [str(item) for item in val]

        return data
    except:
        print("data convertion error")


def upload_health_profile(data):
    ts = int(time.time())
    data["timestamp"] = ts
    try:
        data = convert_to_dynamodb_format(data)
        dynamodb.put_item(TableName=AWS_CONST["dynamodb_table_name"], Item=data)
        return "Profile Saved"
    except botocore.exceptions.ClientError as error:
        print("Error inserting data", error)
