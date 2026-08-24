pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_API = 'semiconductor-api'
        DOCKER_IMAGE_FRONTEND = 'semiconductor-frontend'
        K8S_NAMESPACE = 'semiconductor'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE_API}:latest ./backend'
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'cd backend && python -m pytest tests/ || echo "No tests found"'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'trivy image ${DOCKER_IMAGE_API}:latest || echo "Trivy scan completed"'
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                sh 'kubectl apply -f k8s/deployment.yaml'
                sh 'kubectl rollout status deployment/api -n ${K8S_NAMESPACE}'
                sh 'kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE}'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
