{{/*
Expand the name of the chart.
*/}}
{{- define "tarot-core.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "tarot-core.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used in the chart label.
*/}}
{{- define "tarot-core.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "tarot-core.labels" -}}
helm.sh/chart: {{ include "tarot-core.chart" . }}
{{ include "tarot-core.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "tarot-core.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tarot-core.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "tarot-core.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "tarot-core.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Get secret key with fallback to default
Usage: {{ include "tarot-core.secretKey" (dict "context" $ "prefix" "config.openai" "key" "apiKey") }}
*/}}
{{- define "tarot-core.secretKey" -}}
{{- $context := .context }}
{{- $prefix := .prefix }}
{{- $key := .key }}
{{- $defaultKey := .default | default $key }}
{{- $parts := splitList "." $prefix }}
{{- $value := $context.Values }}
{{- range $parts }}
{{- $value = index $value . }}
{{- end }}
{{- if and $value $value.existingSecretKeys }}
{{- $customKey := index $value.existingSecretKeys $key }}
{{- if $customKey }}
{{- $customKey }}
{{- else }}
{{- $defaultKey }}
{{- end }}
{{- else }}
{{- $defaultKey }}
{{- end }}
{{- end }}

{{/*
App service labels
*/}}
{{- define "tarot-core.app.labels" -}}
{{- include "tarot-core.labels" . }}
app.kubernetes.io/component: app
{{- end }}

{{/*
App selector labels
*/}}
{{- define "tarot-core.app.selectorLabels" -}}
{{- include "tarot-core.selectorLabels" . }}
app.kubernetes.io/component: app
{{- end }}

{{/*
Valkey service labels
*/}}
{{- define "tarot-core.valkey.labels" -}}
{{- include "tarot-core.labels" . }}
app.kubernetes.io/component: valkey
{{- end }}

{{/*
Valkey selector labels
*/}}
{{- define "tarot-core.valkey.selectorLabels" -}}
{{- include "tarot-core.selectorLabels" . }}
app.kubernetes.io/component: valkey
{{- end }}
