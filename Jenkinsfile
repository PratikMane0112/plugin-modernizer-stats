pipeline {
  options {
    timeout(time: 60, unit: 'MINUTES')
    ansiColor('xterm')
    disableConcurrentBuilds(abortPrevious: true)
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '5', numToKeepStr: '5')
  }

  agent {
    label 'linux-arm64-docker || arm64linux'
  }

  environment {
    METADATA_LOCATION = 'public/metadata'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh '''
        asdf install
        npm ci
        '''
      }
    }

    stage('Lint') {
      steps {
        sh '''
        npm run lint
        '''
      }
    }

    stage('Retrieve metadata from metadata-plugin-modernizer') {
      steps {
        sh './fetch-metadata-plugin-modernizer.sh'
      }
    }

    stage('Consolidate data for UI') {
      steps {
        sh 'npx -y tsx scripts/consolidate.ts'
      }
    }

    stage('Build') {
      steps {
        sh '''
        npm run build
        '''
      }
    }

    stage('Deploy to production') {
      when {
        allOf{
          expression { env.BRANCH_IS_PRIMARY }
          // Only deploy from infra.ci.jenkins.io
          expression { infra.isInfra() }
        }
      }
      steps {
        script {
          // Deploy to reports.jenkins.io under the plugin-modernizer/ path
          publishReports(['dist/'])
        }
      }
      post {
        failure {
          sh '''
              # Retrieve azcopy logs to archive them
              cat $HOME/.azcopy/*.log > azcopy.log 2>/dev/null || echo "No azcopy logs found"
          '''
          archiveArtifacts 'azcopy.log'
        }
      }
    }
  }
}
