// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

var UnsafeContentTypes = [...]string{
	"application/javascript",
	"application/ecmascript",
	"text/javascript",
	"text/ecmascript",
	"application/x-javascript",
	"text/html",
}

var MediaContentTypes = [...]string{
	"image/jpeg",
	"image/png",
	"image/bmp",
	"image/gif",
	"image/tiff",
	"image/webp",
	"video/avi",
	"video/mpeg",
	"video/mp4",
	"audio/mpeg",
	"audio/wav",
}

func (api *Handlers) handleGetSurveyStats(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.RequireSystemAdmin(w, r); err != nil {
		return
	}

	surveyStats, err := api.app.GetSurveyStatList()
	if err != nil {
		api.pluginAPI.LogError("handleGetSurveyStats: failed to get survey stats", "error", err.Error())
		http.Error(w, "Failed to get survey stats", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, http.StatusOK, surveyStats)
}

func (api *Handlers) handleGenerateSurveyReport(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.RequireSystemAdmin(w, r); err != nil {
		return
	}

	userID := r.Header.Get(headerMattermostUserID)

	vars := mux.Vars(r)
	surveyID, ok := vars["surveyID"]
	if !ok {
		http.Error(w, "missing survey ID in request", http.StatusBadRequest)
		return
	}

	fileInfo, err := api.app.SendSurveyReport(userID, surveyID)
	if err != nil {
		http.Error(w, "failed to generate survey report", http.StatusInternalServerError)
		return
	}

	webServerMode := api.pluginAPI.GetConfig().ServiceSettings.WebserverMode
	WriteFileResponse(fileInfo.Name, fileInfo.MimeType, fileInfo.Size, time.Now(), *webServerMode, )

	ReturnStatusOK(w)
}


func WriteFileResponse(filename string, contentType string, contentSize int64, lastModification time.Time, webserverMode string, fileReader io.ReadSeeker, forceDownload bool, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, max-age=86400")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	if contentSize > 0 {
		contentSizeStr := strconv.Itoa(int(contentSize))
		if webserverMode == "gzip" {
			w.Header().Set("X-Uncompressed-Content-Length", contentSizeStr)
		} else {
			w.Header().Set("Content-Length", contentSizeStr)
		}
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	} else {
		for _, unsafeContentType := range UnsafeContentTypes {
			if strings.HasPrefix(contentType, unsafeContentType) {
				contentType = "text/plain"
				break
			}
		}
	}

	w.Header().Set("Content-Type", contentType)

	var toDownload bool
	if forceDownload {
		toDownload = true
	} else {
		isMediaType := false

		for _, mediaContentType := range MediaContentTypes {
			if strings.HasPrefix(contentType, mediaContentType) {
				isMediaType = true
				break
			}
		}

		toDownload = !isMediaType
	}

	filename = url.PathEscape(filename)

	if toDownload {
		w.Header().Set("Content-Disposition", "attachment;filename=\""+filename+"\"; filename*=UTF-8''"+filename)
	} else {
		w.Header().Set("Content-Disposition", "inline;filename=\""+filename+"\"; filename*=UTF-8''"+filename)
	}

	// prevent file links from being embedded in iframes
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("Content-Security-Policy", "Frame-ancestors 'none'")

	http.ServeContent(w, r, filename, lastModification, fileReader)
}
