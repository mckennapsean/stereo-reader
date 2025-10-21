# Project Plan: Vision Therapy Reading Tool

## 1. Project Vision & Goals

**Vision:** To create a lightweight and configurable browser extension that aids in vision therapy for strabismus by selectively coloring text. The tool will force stereofusion by splitting text between the left and right eyes, making reading an active therapeutic exercise.

**Primary Goals:**
* Develop a functional browser extension for Chrome/Firefox.
* Allow users to customize text and background colors to match their therapy glasses (e.g., red/blue, red/green).
* Implement an intelligent text-splitting algorithm to make reading challenging but not frustrating.
* Create a simple UI for toggling the effect, adjusting settings, and tracking usage time.
* Ensure the extension is performant and compatible with a wide range of websites.

---

## 2. Key Features & Requirements

| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| F-01 | **Core Text Filtering** | The extension's main function. It will traverse the text on a webpage and apply different colors to segments of the text. | High |
| F-02 | **On/Off Toggle** | A primary button in the extension's popup UI and an optional keyboard shortcut to quickly enable or disable the text filtering effect. | High |
| F-03 | **Color Configuration** | A settings panel where the user can select the two distinct colors for the text (one for each eye) and an optional background color using color pickers. | High |
| F-04 | **Settings Persistence** | User-selected colors and other settings will be saved to the browser's local storage, so they persist between sessions. | High |
| F-05 | **Text Splitting Algorithm** | The logic for how text is divided between the two colors. This will start simple (e.g., alternating characters) and evolve to be more intelligent. | Medium |
| F-06 | **Usage Timer** | A simple timer in the UI that starts when the effect is enabled and resets when disabled, allowing the user to track therapy duration. | Medium |
| F-07 | **Branding** | A unique, memorable name and a simple, intuitive icon for the extension. | Low |

---

## 3. Phased Development Plan

This project will be broken down into four distinct phases to ensure steady progress.

### Phase 1: Proof of Concept (Core Functionality)
*Goal: Create a barebones extension that proves the core concept works.*
* **Task 1.1:** Set up the basic browser extension structure (`manifest.json`, `popup.html`, `content.js`).
* **Task 1.2:** Implement a simple toggle button in the popup that sends a message to the content script.
* **Task 1.3:** Write the initial DOM traversal logic in `content.js` to find all text nodes on a page.
* **Task 1.4:** Implement a basic text-splitting algorithm (e.g., alternating every character).
* **Task 1.5:** Apply hardcoded colors (e.g., pure red and pure blue) to the split text using `<span>` tags.

### Phase 2: Configuration & User Interface
*Goal: Build out the user-facing controls and make the tool configurable.*
* **Task 2.1:** Design and build the `popup.html` UI with HTML/CSS. Include:
    * Color pickers for "Left Eye Color," "Right Eye Color," and "Background Color."
    * The main On/Off toggle switch.
    * A display area for the timer.
* **Task 2.2:** Implement logic to save the selected colors to `chrome.storage.local`.
* **Task 2.3:** Modify the content script to read these saved colors and apply them instead of the hardcoded ones.
* **Task 2.4:** Implement the usage timer. It should start/stop when the toggle is used and display the elapsed time in `MM:SS` format.

### Phase 3: Advanced Text Processing
*Goal: Improve the reading experience by making the text splitting more intelligent.*
* **Task 3.1: (Research)** Investigate best practices for vision therapy text splitting.
    * Does splitting mid-word help or hinder fusion?
    * Is it better to alternate whole words?
    * How should punctuation and spacing be handled?
    * Should the split be random or predictable?
* **Task 3.2:** Implement an improved algorithm based on the research. Ideas to test:
    * **Algorithm A (Word-based):** Alternate colors for each full word.
    * **Algorithm B (Syllable-based):** Attempt to split words by syllable (this is complex).
    * **Algorithm C (Smart Character):** Alternate characters but keep punctuation and spaces with the preceding character.
* **Task 3.3 (Optional):** Add a dropdown in the UI to allow the user to select which splitting algorithm they prefer.

### Phase 4: Refinement & Branding
*Goal: Polish the extension, fix bugs, and give it a proper identity.*
* **Task 4.1:** Test the extension on a variety of websites (news articles, social media, code repositories) and fix any compatibility issues.
    * **Note:** Testing should focus on dynamic content (e.g., infinite scroll, single-page applications) and ensuring the filter is re-applied correctly using a `MutationObserver` (not yet implemented).
* **Task 4.2:** Optimize performance. Ensure that applying the filter to large pages doesn't cause significant lag.
* **Task 4.3: (Brainstorming)** Decide on a final project name.
    * *Ideas:* StereoRead, FusionText, BinocuRead, VisionVerb, Anaglyph Reader, Strabo-Tool.
* **Task 4.4: (Design)** Create a simple and clean icon for the extension.
    * *Ideas:* An icon showing two overlapping, colored circles (like a Venn diagram), a stylized pair of glasses, the letters "R" and "L" in different colors.

---

## 4. Technology Stack

* **Platform:** Browser Extension (Chrome Manifest V3)
* **Languages:** HTML, CSS, JavaScript (ES6+)
* **APIs:** `chrome.storage` API for persistence, `chrome.tabs` and `chrome.runtime` for communication between popup and content scripts.
* **Libraries:** No external libraries are strictly necessary, keeping the extension lightweight.

---

## 5. Potential Challenges & Risks

* **Dynamic Websites:** Modern websites (React, Angular, etc.) that dynamically load and change content may be difficult to handle. The `content.js` script will need to use a `MutationObserver` to watch for changes and re-apply the filter.
* **Performance:** Traversing and wrapping every text node on a very large webpage with `<span>` elements could be slow. The script must be optimized to avoid freezing the browser.
* **Color Accuracy:** The effectiveness depends on the colors chosen matching the user's glasses. Providing an easy-to-use color picker is essential.
* **Text Splitting Logic:** Finding a splitting algorithm that is effective for therapy without being overly fatiguing or unreadable will require experimentation.

---

## 6. Appendix: Future Possibilities

### VS Code Extension

Creating a similar tool for Visual Studio Code is highly feasible and would be an excellent follow-up project. The VS Code Extension API provides powerful tools for manipulating the appearance of text within the editor.

* **Core Technology:** The `Decoration API` would be used to apply custom colors to ranges of text without modifying the actual file content. This is the same API used for syntax highlighting and linting.
* **Implementation:**
    * A command would be created to toggle the effect on or off, which could be bound to a keyboard shortcut.
    * Extension settings would be used to configure the colors, allowing users to define them in their `settings.json` file.
    * The same text-splitting logic from the browser extension could be reused to determine which characters or words receive which color decoration.

This would allow for passive vision therapy while coding, turning a primary work tool into a therapeutic one.