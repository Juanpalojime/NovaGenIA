# Contributing to NovaGenIA

Thank you for your interest in contributing to NovaGenIA! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- NVIDIA GPU with CUDA support (for local testing with models)

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/NovaGenIA.git
cd NovaGenIA
```

2. **Backend Setup**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install pytest pytest-cov pytest-mock  # Dev dependencies
```

3. **Frontend Setup**
```bash
cd app
npm install
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

3. **Test your changes**

Backend:
```bash
python -m pytest tests/ -v
python -m pytest tests/ --cov=server
```

Frontend:
```bash
cd app
npm test
npm run test:coverage
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for functions and classes

```python
def generate_image(prompt: str, steps: int = 25) -> dict:
    """
    Generate an image from a text prompt.
    
    Args:
        prompt: Text description of desired image
        steps: Number of inference steps (default: 25)
        
    Returns:
        Dictionary containing image URL and metadata
    """
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Prefer functional components
- Use meaningful variable names
- Maximum line length: 100 characters

```typescript
interface GenerationParams {
  prompt: string
  steps?: number
  mode?: GenerationMode
}

const generateImage = async (params: GenerationParams): Promise<GenerationResult> => {
  // Implementation
}
```

### React Components

- One component per file
- Use named exports
- Props interface above component
- Destructure props

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  )
}
```

## Testing Guidelines

### Backend Tests

- Place tests in `tests/` directory
- Name test files `test_*.py`
- Use descriptive test names
- Mock external dependencies (GPU, models)

```python
def test_generate_endpoint_success(client, mock_pipe):
    """Test successful image generation"""
    payload = {"prompt": "test", "steps": 20}
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    assert "images" in response.json()
```

### Frontend Tests

- Place tests next to components (`Component.test.tsx`)
- Test user interactions
- Test state changes
- Mock API calls

```typescript
describe('GenerationStore', () => {
  it('should update prompt', () => {
    const { setPrompt, prompt } = useGenerationStore.getState()
    setPrompt('test prompt')
    expect(prompt).toBe('test prompt')
  })
})
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add JSDoc/docstrings for new functions
- Include examples in documentation

## Pull Request Process

1. **Ensure all tests pass**
2. **Update documentation**
3. **Add description to PR**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
4. **Link related issues**
5. **Request review from maintainers**

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] Coverage maintained or improved

## Reporting Bugs

### Before Submitting

- Check existing issues
- Try to reproduce with latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 11]
- Python version: [e.g. 3.10.5]
- Node version: [e.g. 18.16.0]
- GPU: [e.g. RTX 3090]

**Additional context**
Any other relevant information.
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information.
```

## Development Tips

### Running Backend Without GPU

Tests use mocks, so you can develop without a GPU:

```bash
python -m pytest tests/ -v
```

### Frontend Development

Use mock API responses:

```typescript
// In development, mock the API
if (import.meta.env.DEV) {
  // Mock implementation
}
```

### Hot Reload

Both backend and frontend support hot reload:

```bash
# Backend (with uvicorn)
uvicorn server:app --reload

# Frontend
npm run dev
```

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NovaGenIA! 🚀
