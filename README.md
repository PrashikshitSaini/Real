# REAL - A Minimalist Journal App 📝

<div align="center">

![REAL Logo](docs/realLogo.svg)

*Write like no one's watching.*

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/PrashikshitSaini/Real?style=social)](https://github.com/PrashikshitSaini/Real/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/PrashikshitSaini/Real)](https://github.com/PrashikshitSaini/Real/issues)

[Download](#download) • [Features](#features) • [For Developers](#for-developers) • [Contributing](#contributing)

</div>

## 🌟 About REAL

REAL is a distraction-free journaling application designed for people who want to focus on their thoughts without the noise. No complicated menus, no cloud sync, just you and your words.

## ✨ Features

- **🎯 Distraction-Free Writing**: Clean interface with no unnecessary menus or popups
- **💾 Automatic Saving**: Your entries are saved instantly as you type
- **🔒 Privacy-First**: All data stays local on your machine - no cloud, no sign-up
- **🖥️ Cross-Platform**: Available for Windows, Linux, and macOS (build from source)
- **🎨 Minimalist Design**: Beautiful, modern interface that stays out of your way
- **📱 Responsive**: Works great on any screen size

## 🚀 Getting Started

### Download

Choose your platform:

#### Windows
- Download the latest release for Windows [here](https://github.com/PrashikshitSaini/Real/releases/download/v1.0.0/dist-windows-latest.zip)
- Extract the ZIP file
- Run `REAL.exe`

#### Linux
- Download the latest release for Linux [here](https://github.com/PrashikshitSaini/Real/releases/download/v1.0.0/dist-ubuntu-latest.zip)
- Extract the ZIP file
- Run `./REAL`

#### macOS
For macOS users, please build from source as we currently don't have an Apple Developer Account. See the [Building from Source](#building-from-source) section below.

## 👩‍💻 For Developers

### Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Electron
- **Build**: Electron Builder

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/PrashikshitSaini/Real.git
   cd Real
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   # For Windows
   npm run build:win
   
   # For Linux
   npm run build:linux
   
   # For macOS
   npm run build:mac
   ```

### Project Structure

```
Real/
├── src/              # Source code
├── docs/             # Documentation and website
├── dist/            # Built application
├── main.js          # Electron main process
└── package.json     # Dependencies and scripts
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [TailwindCSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

If you encounter any issues or have questions:

- [Open an issue](https://github.com/PrashikshitSaini/Real/issues)
- [Check existing issues](https://github.com/PrashikshitSaini/Real/issues?q=is%3Aissue)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/PrashikshitSaini">Prashikshit Saini</a>
</div> 