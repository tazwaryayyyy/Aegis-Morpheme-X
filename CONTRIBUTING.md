# Contributing to AMX Protocol

Thank you for your interest in contributing to the AegisMorpheme-X (AMX) Protocol! This document provides guidelines for contributors.

## 🚀 Project Overview

AMX Protocol is a **self-governing, verifiable AI health + finance network** featuring:
- **Executable Morpheme-X** sealed on Hedera HCS
- **Meta-Sentinel** anomaly detection with economic enforcement
- **Adaptive parametric insurance** with automatic HTS payouts
- **Dynamic city switching** for global adaptability
- **Professional demo reports** and visualizations
- **Automated retraining** with progress tracking

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/amx-protocol.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📋 Development Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- Hedera Testnet account (for live testing)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Hedera credentials
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Hedera        │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   HCS/HTS       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  Agent Mesh     │
                       │ (LangGraph)     │
                       └─────────────────┘
```

## 📝 Code Style

### Python
- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters
- Use f-strings for string formatting

### JavaScript/React
- Use ES6+ features
- Functional components with hooks
- Proper error boundaries
- Consistent naming conventions

## 🔧 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
python test_end_to_end.py
```

## 🐛 Bug Reports

When reporting bugs, please include:
- Operating system and Python/Node.js versions
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Screenshots if applicable

## 💡 Feature Requests

Feature requests should:
- Have a clear title and description
- Explain the use case
- Consider implementation complexity
- Follow existing issue templates

## 📖 Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update API documentation for backend changes
- Include examples for new features

## 🔒 Security

- Never commit secrets or API keys
- Use .env.example for configuration templates
- Report security issues privately
- Follow principle of least privilege

## 🏷️ Commit Messages

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

Examples:
```
feat: add city switching functionality
fix: resolve WebSocket race condition
docs: update Hedera setup guide
```

## 🔄 Pull Request Process

1. **Title**: Clear and descriptive
2. **Description**: What changed and why
3. **Testing**: How you tested the changes
4. **Screenshots**: For UI changes
5. **Breaking Changes**: Clearly marked if any

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] Ready for review

## 🤝 Code Review

- Be constructive and respectful
- Focus on code quality, not style nitpicks
- Ask questions if something is unclear
- Suggest improvements, don't just point out issues

## 📦 Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release tag
4. Publish to package managers (if applicable)
5. Update documentation

## 🌟 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- Create an issue for bugs
- Start a discussion for questions
- Check existing documentation
- Join our community discussions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AMX Protocol! 🚀
