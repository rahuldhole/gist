package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

// ── Configuration ─────────────────────────────────────────────────────────────

const (
	srcDir     = "src"
	distDir    = "dist"
	headerFile = "helpers/header.html"
	footerFile = "helpers/footer.html"
	maxWorkers = 10 // Concurrent worker limit for processing apps
)

// Pre-compiled regexes for performance
var (
	reMetaBlock = regexp.MustCompile(`(?s)<!-- APP-META(.*?)-->`)
	reTitleTag  = regexp.MustCompile(`(?i)<title>([^<]+)</title>`)
	reBodyTag   = regexp.MustCompile(`(?i)(<body[^>]*>)`)
	reHtmlTag   = regexp.MustCompile(`(?i)(<html[^>]*>)`)
)

// Colors for terminal output
const (
	red    = "\033[0;31m"
	green  = "\033[0;32m"
	yellow = "\033[0;33m"
	cyan   = "\033[0;36m"
	bold   = "\033[1m"
	dim    = "\033[2m"
	nc     = "\033[0m"
)

func logInfo(msg string, args ...interface{})    { fmt.Printf(cyan+"ℹ"+nc+"  "+msg+"\n", args...) }
func logSuccess(msg string, args ...interface{}) { fmt.Printf(green+"✓"+nc+"  "+msg+"\n", args...) }
func logWarn(msg string, args ...interface{})    { fmt.Printf(yellow+"⚠"+nc+"  "+msg+"\n", args...) }
func logError(msg string, args ...interface{})   { fmt.Printf(red+"✗"+nc+"  "+msg+"\n", args...) }
func logSkip(msg string, args ...interface{})    { fmt.Printf(dim+"⊘  "+msg+nc+"\n", args...) }

// ── App Metadata Model ───────────────────────────────────────────────────────

type AppMeta struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	Image       string    `json:"image"`
	Icon        string    `json:"icon"`
	Path        string    `json:"path"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ── Build Context ─────────────────────────────────────────────────────────────

type BuildCtx struct {
	Header []byte
	Footer []byte
}

// ── Metadata Extraction ──────────────────────────────────────────────────────

func extractMeta(key, content string) string {
	match := reMetaBlock.FindStringSubmatch(content)
	if len(match) < 2 {
		return ""
	}

	lines := strings.Split(match[1], "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(strings.ToLower(line), strings.ToLower(key)+":") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				return strings.TrimSpace(parts[1])
			}
		}
	}
	return ""
}

// ── Concurrency Safe App Processor ───────────────────────────────────────────

func processApp(ctx context.Context, bCtx *BuildCtx, appDir os.DirEntry) (*AppMeta, error) {
	name := appDir.Name()
	srcIdx := filepath.Join(srcDir, name, "index.html")
	distIdx := filepath.Join(distDir, name, "index.html")

	// Ensure source meta shell is present
	ensureMetaBlock(srcIdx, name)

	content, err := os.ReadFile(srcIdx)
	if err != nil {
		return nil, err
	}
	cStr := string(content)

	status := extractMeta("Status", cStr)
	if status == "" {
		status = "published"
	}

	// Copy & Inject
	if err := os.MkdirAll(filepath.Dir(distIdx), 0755); err != nil {
		return nil, err
	}
	if err := copyFile(srcIdx, distIdx); err != nil {
		return nil, err
	}
	if err := injectIntoFile(distIdx, bCtx.Header, bCtx.Footer); err != nil {
		return nil, err
	}

	if status != "published" {
		logSkip("  Skipped: %s (%s)", name, status)
		return nil, nil
	}

	title := extractMeta("Title", cStr)
	if title == "" {
		title = name
	}

	// Parse custom "Updated" field from meta block
	updatedStr := extractMeta("Updated", cStr)
	updatedAt, err := time.Parse("2006-01-02", updatedStr)
	if err != nil {
		// Fallback to file timestamp if meta is missing/broken
		if info, err := os.Stat(srcIdx); err == nil {
			updatedAt = info.ModTime()
		} else {
			updatedAt = time.Now()
		}
	}

	return &AppMeta{
		Title:       title,
		Description: extractMeta("Description", cStr),
		Category:    extractMeta("Category", cStr),
		Image:       extractMeta("Image", cStr),
		Icon:        extractMeta("Icon", cStr),
		Status:      status,
		Path:        name + "/",
		UpdatedAt:   updatedAt,
	}, nil
}

// ── Optimized File Operations ───────────────────────────────────────────────

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

func injectIntoFile(target string, header, footer []byte) error {
	content, err := os.ReadFile(target)
	if err != nil {
		return err
	}
	html := string(content)

	if len(header) > 0 {
		hStr := string(header)
		if reBodyTag.MatchString(html) {
			html = reBodyTag.ReplaceAllString(html, "$1\n"+hStr)
		} else if reHtmlTag.MatchString(html) {
			html = reHtmlTag.ReplaceAllString(html, "$1\n"+hStr)
		} else {
			html = hStr + "\n" + html
		}
	}

	if len(footer) > 0 {
		fStr := string(footer)
		if strings.Contains(strings.ToLower(html), "</body>") {
			html = strings.Replace(html, "</body>", fStr+"\n</body>", 1)
		} else if strings.Contains(strings.ToLower(html), "</html>") {
			html = strings.Replace(html, "</html>", fStr+"\n</html>", 1)
		} else {
			html = html + "\n" + fStr
		}
	}

	return os.WriteFile(target, []byte(html), 0644)
}

func ensureMetaBlock(path, slug string) {
	bytes, _ := os.ReadFile(path)
	if strings.Contains(string(bytes), "<!-- APP-META") {
		return
	}

	title := slug
	if match := reTitleTag.FindStringSubmatch(string(bytes)); len(match) > 1 {
		title = strings.TrimSpace(match[1])
	}

	meta := fmt.Sprintf("<!-- APP-META\nTitle: %s\nDescription:\nCategory:\nStatus: published\nUpdated: %s\n-->\n", 
		title, time.Now().Format("2006-01-02"))
	_ = os.WriteFile(path, append([]byte(meta), bytes...), 0644)
}

func cmdUpdateMetadata() {
	logInfo("Scanning for changes to update metadata...")
	
	// Get changed folders in src/ relative to previous commit
	// In GitHub Actions, we can check files in the current commit
	cmd := exec.Command("git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD")
	out, err := cmd.Output()
	if err != nil {
		logError("Failed to get git diff: %v", err)
		return
	}

	today := time.Now().Format("2006-01-02")
	changedApps := make(map[string]bool)
	lines := strings.Split(string(out), "\n")
	
	for _, line := range lines {
		if strings.HasPrefix(line, "src/") {
			parts := strings.Split(line, "/")
			if len(parts) >= 2 {
				appName := parts[1]
				if appName != "index.html" {
					changedApps[appName] = true
				}
			}
		}
	}

	if len(changedApps) == 0 {
		logInfo("No app changes detected in src/.")
		return
	}

	for appName := range changedApps {
		path := filepath.Join(srcDir, appName, "index.html")
		if _, err := os.Stat(path); os.IsNotExist(err) {
			continue
		}

		content, _ := os.ReadFile(path)
		cStr := string(content)
		
		if !strings.Contains(cStr, "<!-- APP-META") {
			ensureMetaBlock(path, appName)
			continue
		}

		// Update or Add "Updated: YYYY-MM-DD"
		re := regexp.MustCompile(`(?s)(<!-- APP-META.*?-->)`)
		match := re.FindStringSubmatch(cStr)
		if len(match) > 0 {
			block := match[1]
			var newBlock string
			if strings.Contains(strings.ToLower(block), "updated:") {
				// Replace existing
				reUp := regexp.MustCompile(`(?i)Updated:\s*[^\n]+`)
				newBlock = reUp.ReplaceAllString(block, "Updated: "+today)
			} else {
				// Add new before the end
				newBlock = strings.Replace(block, "-->", "Updated: "+today+"\n-->", 1)
			}
			newContent := strings.Replace(cStr, block, newBlock, 1)
			os.WriteFile(path, []byte(newContent), 0644)
			logSuccess("  Updated timestamp for %s", appName)
		}
	}
}

// ── Command Implementation ───────────────────────────────────────────────────

func cmdBuild() {
	start := time.Now()
	logInfo("🚀 Initializing metadata-driven build...")

	header, _ := os.ReadFile(headerFile)
	footer, _ := os.ReadFile(footerFile)
	bCtx := &BuildCtx{Header: header, Footer: footer}

	os.RemoveAll(distDir)
	_ = os.MkdirAll(distDir, 0755)

	dirs, err := os.ReadDir(srcDir)
	if err != nil {
		logError("Source directory missing: %v", err)
		os.Exit(1)
	}

	var (
		wg      sync.WaitGroup
		mu      sync.Mutex
		apps    []AppMeta
		tokens  = make(chan struct{}, maxWorkers)
	)

	for _, d := range dirs {
		name := d.Name()
		if name == distDir || name == ".DS_Store" {
			continue
		}

		if !d.IsDir() {
			srcPath := filepath.Join(srcDir, name)
			distPath := filepath.Join(distDir, name)
			wg.Add(1)
			go func(s, ds string) {
				defer wg.Done()
				_ = copyFile(s, ds)
			}(srcPath, distPath)
			continue
		}

		wg.Add(1)
		go func(entry os.DirEntry) {
			defer wg.Done()
			tokens <- struct{}{}
			defer func() { <-tokens }()

			app, err := processApp(context.Background(), bCtx, entry)
			if err != nil {
				logError("  Failed %s: %v", entry.Name(), err)
				return
			}
			if app != nil {
				mu.Lock()
				apps = append(apps, *app)
				mu.Unlock()
				logSuccess("  Synthesized: %s", entry.Name())
			}
		}(d)
	}

	wg.Wait()

	sort.Slice(apps, func(i, j int) bool {
		return apps[i].UpdatedAt.After(apps[j].UpdatedAt)
	})

	jsonData, _ := json.MarshalIndent(apps, "", "  ")
	_ = os.WriteFile(filepath.Join(distDir, "apps.json"), jsonData, 0644)

	logSuccess("\n✨ Build complete in %v", time.Since(start))
	logInfo("Registry: dist/apps.json (%d apps)", len(apps))
}

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "build":
		cmdBuild()
	case "update-metadata":
		cmdUpdateMetadata()
	case "preview":
		port := "8080"
		if len(os.Args) > 2 {
			port = os.Args[2]
		}
		logInfo("📡 Serving dist/ on http://localhost:%s", port)
		log.Fatal(http.ListenAndServe(":"+port, http.FileServer(http.Dir(distDir))))
	case "clean":
		os.RemoveAll(distDir)
		logSuccess("Cleaned workspace.")
	default:
		usage()
	}
}

func usage() {
	fmt.Printf("%sUsage:%s go run gist.go [build|preview|clean]\n", bold, nc)
}
