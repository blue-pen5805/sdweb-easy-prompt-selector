# Easy Prompt Selector

[使い方(暫定)](https://blue-pen5805.fanbox.cc/posts/5306601)

## English Readme

This extension, designed to simplify the process of inputting prompts, is currently available exclusively in Japanese. An English version may be considered for future development.

I created this tool due to frequent errors and forgetfulness in word usage, and to manage Dynamic Prompts which I found to be overly complex.

It's important to mention that the testing of this extension has been limited to local Windows environments. As such, its performance on platforms like colab remains uncertain.

Feedback is highly appreciated from anyone who has successfully operated it. However, be aware that troubleshooting may not be possible if it doesn't function as intended.

### Features

Please watch the video below for a quick overview (mp4 file download required due to GitHub limitations).

[![How to Use](media/02-01.png)](media/%E7%B0%A1%E5%8D%98%E3%81%AA%E4%BD%BF%E3%81%84%E6%96%B9.mp4)

Due to recording limitations, the drop-down menu does not appear in the video.

- Type in any words you like by pressing the button.
- Use categories for random input, like a wildcard.
- Customize the tool to suit your needs.

### Installation

1. Navigate to the "Extensions" tab.
2. Open the "Install from URL" section.
3. Enter `https://github.com/blue-pen5805/sdweb-easy-prompt-selector` in the "URL of the extension repository" field.
4. Click "Install" and wait a moment.
5. Go to the "Installed" tab and click "Apply and restart the UI".

After loading, you should see this:

![🔯Select Tag](media/01-01.jpeg)

Click "🔯Select Tag" under the style, and the screen will look like this:

![Screenshot of easy prompt selector](media/01-02.jpeg)

### Usage

Clicking a button automatically adds the corresponding string to the prompt input field. It's quite straightforward, isn't it?

As a bonus feature, if you press the orange button, one of the options in the category will be randomly selected at the time of generation.

[![Random Generation](media/02-02.png)](media/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E7%94%9F%E6%88%90.mp4)

(Viewing this video requires downloading the mp4 file due to GitHub limitations)

### Customization

Add a *.yml file to `stable-diffusion-webui\extensions\sdweb-easy-prompt-selector\tags`, and you can add, change, and delete freely.

In general, it should be self-explanatory if you inspect the default file!

This file is in yaml format, which can be written in various ways.

For now, let's focus on the following methods:

#### For users who just want the buttons to appear

List your options starting with a "-".

Example: tags/test.yml

```yml
- standing
- sitting
- squatting
```
![just buttons](media/01-03.jpeg)

#### For users who want to customize the button labels

List your options in the "display name: input string" format.

Example: tags/test.yml

```yml
Stand: standing
Sit: sitting
Squat: squatting
```

![with name customized bottuns](media/01-04.jpeg)

#### For users who want to categorize

Add "category name:", and precede the next line with one or more spaces (two is recommended).

Example: tags/test.yml

```yml
Posture:
  Stand: standing
  Sit: sitting
  Squat: squatting
```

![with category name](media/01-05.jpeg)

When including numbers, symbols, or brackets (like {}, <>), encase the string in "".

Example: tags/test.yml

```yml
Number: "1"
Wildcard: "{__pose__}"
```

![with quotation mark](media/01-06.jpeg)

After that, you can mix and match these methods (you can also layer categories).

### A common mistake

Do not line up items with the same name.

Example: tags/test.yml

```yml
Building:
  House: house
  House: home
```

### Cautions

- This extension may behave unpredictably if you regularly use the "@" symbol in your prompts.
- Folder division in `/tags` is not supported.
- You may need to restart the webui when adding a yml file.
- If you are using the random feature, it's safer to restart when making changes.
- If the "Select Tag" button doesn't respond, there's likely an error in your yml file, or the syntax isn't supported.
- When editing yaml files with Mac TextEdit, please set the line break code to CRLF.

### Additional Notes

Currently, only three files are prepared for people, hair and faces, but more may be added in the future.

These will appear in `sdweb-easy-prompt-selector/tags_examples/`, so feel free to copy from there as needed.

### If something is unclear

If you have any problems, please feel free to post them in the "Issues" section (although please note that I can't guarantee I'll be able to respond to all inquiries).

## The Prompt Input Extension Has Been Updated

April 9, 2023, 16:14

Check out these new features!

- Tags can now be deleted by right-clicking on the buttons.
- The random function can now be used with wildcards.
- Original prompt input is recorded in images as PNG Info when using the random function.
- Support for infinite random loops has been added!
- You can now specify the number of iterations in the random function (similar to Dynamic Prompts).

### Delete Tags by Right-Clicking on Buttons

Exactly as described. You can now delete a tag by clicking the button and then right-clicking on it.

[![left-right click](media/02-03.png)](media/%E3%82%AF%E3%83%AA%E3%83%83%E3%82%AF%E3%81%97%E3%81%9F%E3%82%8A%E5%8F%B3%E3%82%AF%E3%83%AA%E3%83%83%E3%82%AF%E3%81%97%E3%81%9F%E3%82%8A%E3%81%97%E3%81%A6%E3%81%BE%E3%81%99%EF%BC%81.mp4)

(Viewing this video requires downloading the mp4 file due to GitHub limitations)

Thank you, [MrKuenning](https://github.com/MrKuenning), for your request on GitHub!

### Wildcards Now Supported in Random Function

Previously, the random function (for example @something@ like stuff), Dynamic Prompts, wildcards, and other core style features could not be used in tandem. Now, they can coexist, although there may still be some limitations.

Please note, the tagging of sdweb-eagle-pnginfo may not work as expected due to this change.

For users of sdweb-eagle-pnginfo, I suggest either:

1. Enabling the option to use the old implementation of the random function in the settings (to maintain compatibility with sdweb-eagle-pnginfo), or
2. Migrating to the updated version of sdweb-eagle-pnginfo available here: [sdweb-eagle-pnginfo](https://github.com/blue-pen5805/sdweb-eagle-pnginfo).

### Recording of Original Prompt Input

Now when you use the random function, the original prompt you entered can be recorded as shown:

![original prompt input](media/01-07.jpeg)

To use this feature, enable "Save the original prompt in pnginfo" from the settings screen.

Thanks to null0000 & Rinoma for suggesting this feature on our [Discord](https://blue-pen5805.fanbox.cc/posts/5664903)!

Note that the recorded prompt will have line breaks removed to ensure compatibility with the "send to" function.

### Support for Infinite Random Loops

You can now do things like having a random function within a random function!

Example: hair.yml

```yml
Color:
  Black: black
  White: white

Hair color:
  Random: '@hair:Color@ hair'
```

You can now create random functions within other random functions! If you write it this way, typing @hair:Hair color@ will give you black hair or white hair!

Please note: Despite the term "infinite", there is actually a limit of 100 loops.

### Specify the Number of Iterations in the Random Function

You can specify how many times a tag will be added by the random function.

Example: animal.yml

```yml
Cute:
  Cat: cat
  Dog: dog
  Panda: panda
  Gorilla: gorilla
```

@3$$animal:Cute@ -> "panda, cat, dog"

@0-2$$animal:Cute@ -> sometimes "cat", sometimes "dog, panda", or nothing

Please be aware that this might result in duplicate tags, as it does not avoid duplications.

### In Closing

I apologize for any bugs that may occur! I appreciate your understanding.
