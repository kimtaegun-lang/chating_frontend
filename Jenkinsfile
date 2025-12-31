pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-north-1'
        S3_BUCKET = 'chat-frontend-tycoon'
        CLOUDFRONT_ID = 'E24UX34R888UZI'

        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')

        REACT_APP_SERVER_PORT = 'https://djumlaxg41tmt.cloudfront.net'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build (Docker)') {
            steps {
                sh """
                    docker build \
                      --build-arg REACT_APP_SERVER_PORT=${REACT_APP_SERVER_PORT} \
                      -t frontend-build .

                    docker create --name temp_frontend frontend-build
                    docker cp temp_frontend:/app/build ./build
                    docker rm temp_frontend
                """
            }
        }

        stage('Deploy to S3') {
            steps {
                sh """
                    aws s3 sync ./build s3://${S3_BUCKET} --delete \
                      --cache-control 'public, max-age=31536000, immutable'

                    aws s3 cp ./build/index.html s3://${S3_BUCKET}/index.html \
                      --cache-control 'no-cache, no-store, must-revalidate'
                """
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                sh """
                    aws cloudfront create-invalidation \
                      --distribution-id ${CLOUDFRONT_ID} \
                      --paths '/*'
                """
            }
        }
    }

    post {
        always {
            sh 'docker rmi frontend-build || true'
            cleanWs()
        }
        success {
            echo '프론트엔드 배포 성공'
        }
        failure {
            echo '프론트엔드 배포 실패'
        }
    }
}
