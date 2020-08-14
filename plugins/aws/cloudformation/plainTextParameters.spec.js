var expect = require('chai').expect;
const plainTextParameters = require('./plainTextParameters');
const settings = {
    plainTextParameters: {
        secretWords: [
            'secret', 'password', 'privatekey'
        ]
    }
};
const describeStacks = [
        {
            StackId: 'arn:aws:cloudformation:us-east-1:55005500:stack/TestStack/1493b310-dc80-11ea-b8ab-1214c28caebf',
            StackName: 'TestStack',
            Parameters: [
                {
                    ParameterKey: 'Secret',
                    ParameterValue: 'bucketwithsecretparameter1'
                },
                {
                    ParameterKey: 'Password',
                    ParameterValue: 'bucketwithsecretparameter1'
                }
            ],
            CreationTime: '2020-08-13T13:34:52.435Z',
            RollbackConfiguration: { RollbackTriggers: [] },
            StackStatus: 'CREATE_COMPLETE',
            DisableRollback: false,
            NotificationARNs: [],
            Capabilities: [],
            Outputs: [],
            Tags: [],
            DriftInformation: { StackDriftStatus: 'NOT_CHECKED' }
        },
        {
            StackId: 'arn:aws:cloudformation:us-east-1:55005500:stack/TestStack/1493b310-dc80-11ea-b8ab-1214c28caebf',
            StackName: 'TestStack',
            Parameters: [
                {
                    ParameterKey: 'S3BucketName',
                    ParameterValue: 'testbucketplaintext1'
                }
            ],
            CreationTime: '2020-08-12T09:42:04.803Z',
            RollbackConfiguration: { RollbackTriggers: [] },
            StackStatus: 'CREATE_COMPLETE',
            DisableRollback: false,
            NotificationARNs: [],
            Capabilities: [],
            Outputs: [],
            Tags: [],
            DriftInformation: { StackDriftStatus: 'NOT_CHECKED' }
        },
        {
            StackId: 'arn:aws:cloudformation:us-east-1:55005500:stack/TestStack/1493b310-dc80-11ea-b8ab-1214c28caebf',
            StackName: 'TestStack',
            Parameters: [],
            CreationTime: '2020-08-12T09:42:04.803Z',
            RollbackConfiguration: { RollbackTriggers: [] },
            StackStatus: 'CREATE_COMPLETE',
            DisableRollback: false,
            NotificationARNs: [],
            Capabilities: [],
            Outputs: [],
            Tags: [],
            DriftInformation: { StackDriftStatus: 'NOT_CHECKED' }
        }
]

const createCache = (stacks) => {
    return {
        cloudformation: {
            describeStacks: {
                'us-east-1': {
                    data: stacks
                },
            },
        },
    };
};

const createErrorCache = () => {
    return {
        cloudformation: {
            describeStacks: {
                'us-east-1': {
                    err: {
                        message: 'error describing cloudformation stacks'
                    },
                },
            },
        },
    };
};

const createNullCache = () => {
    return {
        cloudformation: {
            describeStacks: {
                'us-east-1': null,
            },
        },
    };
};

describe('plainTextParameters', function () {
    describe('run', function () {
        it('should FAIL if Stack parameters contain one of secret words ["password" , "privatekey", "secret"]', function (done) {
            const cache = createCache([describeStacks[0]]);
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(1);
                done();
            });
        });

        it('should PASS if Stack parameters does not contain any of secret words ["password" , "privatekey", "secret"]', function (done) {
            const cache = createCache([describeStacks[1]]);
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                done();
            });
        });

        it('should PASS if unable to describe stacks', function (done) {
            const cache = createCache([]);
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                done();
            });
        });

        it('should PASS if there is no parameter in the stack', function (done) {
            const cache = createCache([describeStacks[2]]);
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                done();
            });
        });

        it('should not return any results if unable to fetch any stack description', function (done) {
            const cache = createNullCache();
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(0);
                done();
            });
        });

        it('should UNKNOWN if error occurs while fetching stack description', function (done) {
            const cache = createErrorCache();
            plainTextParameters.run(cache, settings, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                done();
            });
        });

    });
});