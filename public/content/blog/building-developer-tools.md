---
title: "Building Developer Tools That Engineers Actually Use"
date: "2024-02-20"
author: "Punit Mishra"
category: "Technical"
tags: ["Developer Experience", "Tools", "Productivity", "Engineering", "DX"]
readTime: "14 min"
featured: true
---

# Building Developer Tools That Engineers Actually Use

> Why most internal tools fail, and the patterns that make developers actually adopt them.

## The Graveyard of Internal Tools

Every engineering organization has them—internal tools that were built with good intentions but now sit unused. The CLI nobody remembers. The dashboard that's always out of date. The automation that's more trouble than it's worth.

After building tools used by hundreds of engineers, I've learned why some tools get adopted and others get abandoned.

## Principle 1: Solve a Pain Point, Not a Process

### The Anti-Pattern

```
PM: "We need a tool to enforce our code review process"
Engineer: *builds elaborate workflow tool*
Result: Engineers find workarounds
```

### The Pattern

```
Observation: Engineers spend 20 minutes per PR waiting for CI
Solution: Tool that runs relevant tests locally in 30 seconds
Result: 95% adoption in first week
```

The difference? One tool adds friction, the other removes it.

## Principle 2: Meet Engineers Where They Are

### Command Line First

Engineers live in terminals. Build CLI tools first.

```python
import click
import rich
from rich.console import Console
from rich.table import Table

console = Console()

@click.group()
def cli():
    """Developer productivity toolkit."""
    pass

@cli.command()
@click.argument('service')
@click.option('--env', default='staging', help='Environment to deploy to')
@click.option('--dry-run', is_flag=True, help='Show what would be deployed')
def deploy(service: str, env: str, dry_run: bool):
    """Deploy a service to the specified environment."""

    if dry_run:
        console.print(f"[yellow]Would deploy {service} to {env}[/yellow]")
        show_diff(service, env)
        return

    with console.status(f"Deploying {service} to {env}..."):
        result = run_deployment(service, env)

    if result.success:
        console.print(f"[green]✓[/green] Deployed {service} to {env}")
        console.print(f"  URL: {result.url}")
    else:
        console.print(f"[red]✗[/red] Deployment failed")
        console.print(result.error)

@cli.command()
@click.argument('query')
def logs(query: str):
    """Search logs across all services."""

    table = Table(title=f"Logs matching: {query}")
    table.add_column("Time", style="dim")
    table.add_column("Service", style="cyan")
    table.add_column("Level")
    table.add_column("Message")

    for log in search_logs(query, limit=50):
        level_color = {
            "ERROR": "red",
            "WARN": "yellow",
            "INFO": "green"
        }.get(log.level, "white")

        table.add_row(
            log.timestamp,
            log.service,
            f"[{level_color}]{log.level}[/{level_color}]",
            log.message[:100]
        )

    console.print(table)

if __name__ == "__main__":
    cli()
```

### IDE Integration Second

If engineers use the CLI, add IDE integration:

```json
// VS Code tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Deploy to Staging",
      "type": "shell",
      "command": "devkit deploy ${input:service} --env staging",
      "problemMatcher": []
    },
    {
      "label": "Search Logs",
      "type": "shell",
      "command": "devkit logs ${input:query}",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "service",
      "type": "promptString",
      "description": "Service to deploy"
    },
    {
      "id": "query",
      "type": "promptString",
      "description": "Log search query"
    }
  ]
}
```

## Principle 3: Speed Is a Feature

### The 100ms Rule

Any tool that takes more than 100ms to start loses users. Here's how to achieve it:

**Lazy Loading**

```python
# Don't do this
from heavy_analytics_lib import analyze  # Takes 500ms to import

# Do this instead
def get_analyzer():
    from heavy_analytics_lib import analyze
    return analyze
```

**Caching**

```python
import hashlib
import json
from pathlib import Path
from functools import wraps

CACHE_DIR = Path.home() / ".cache" / "devkit"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def cached(ttl_seconds: int = 300):
    """Cache function results to disk."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            key_data = f"{func.__name__}:{args}:{sorted(kwargs.items())}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()
            cache_file = CACHE_DIR / f"{cache_key}.json"

            # Check cache
            if cache_file.exists():
                cache_data = json.loads(cache_file.read_text())
                if time.time() - cache_data["timestamp"] < ttl_seconds:
                    return cache_data["result"]

            # Compute and cache result
            result = func(*args, **kwargs)
            cache_data = {
                "timestamp": time.time(),
                "result": result
            }
            cache_file.write_text(json.dumps(cache_data))

            return result
        return wrapper
    return decorator

@cached(ttl_seconds=60)
def get_service_status(service: str) -> dict:
    """Get service status (cached for 1 minute)."""
    return api_client.get_status(service)
```

**Background Updates**

```python
import threading
from queue import Queue

class BackgroundUpdater:
    """Update data in background while showing stale data immediately."""

    def __init__(self):
        self.cache = {}
        self.update_queue = Queue()
        self.worker = threading.Thread(target=self._worker, daemon=True)
        self.worker.start()

    def get(self, key: str, fetch_fn: callable) -> any:
        """Get cached value immediately, update in background."""
        if key in self.cache:
            # Return stale data immediately
            result = self.cache[key]["data"]
            # Queue background update
            self.update_queue.put((key, fetch_fn))
            return result
        else:
            # First fetch must be synchronous
            data = fetch_fn()
            self.cache[key] = {"data": data, "timestamp": time.time()}
            return data

    def _worker(self):
        while True:
            key, fetch_fn = self.update_queue.get()
            try:
                data = fetch_fn()
                self.cache[key] = {"data": data, "timestamp": time.time()}
            except Exception as e:
                pass  # Keep stale data on failure
```

## Principle 4: Fail Helpfully

### Bad Error Messages

```
Error: Operation failed
Error: Invalid input
Error: Connection refused
```

### Good Error Messages

```python
class DevToolError(Exception):
    def __init__(self, message: str, suggestions: list = None):
        self.message = message
        self.suggestions = suggestions or []

def connect_to_cluster(cluster_name: str):
    try:
        return kubernetes.connect(cluster_name)
    except ConnectionError:
        raise DevToolError(
            f"Cannot connect to cluster '{cluster_name}'",
            suggestions=[
                f"Check if cluster exists: devkit clusters list",
                f"Verify your kubeconfig: kubectl config get-contexts",
                f"Try refreshing credentials: devkit auth refresh",
            ]
        )

# In CLI handler
@cli.command()
def deploy(service: str):
    try:
        run_deployment(service)
    except DevToolError as e:
        console.print(f"[red]Error:[/red] {e.message}")
        if e.suggestions:
            console.print("\n[yellow]Suggestions:[/yellow]")
            for suggestion in e.suggestions:
                console.print(f"  • {suggestion}")
        raise SystemExit(1)
```

## Principle 5: Self-Documenting Commands

### Built-in Help That's Actually Helpful

```python
@cli.command()
@click.argument('service')
@click.option(
    '--env',
    type=click.Choice(['dev', 'staging', 'prod']),
    default='staging',
    help='Target environment for deployment'
)
@click.option(
    '--version',
    help='Specific version to deploy (default: latest)'
)
@click.option(
    '--dry-run',
    is_flag=True,
    help='Preview changes without applying them'
)
def deploy(service: str, env: str, version: str, dry_run: bool):
    """
    Deploy a service to an environment.

    Examples:

        # Deploy latest version to staging
        devkit deploy user-service

        # Deploy specific version to production
        devkit deploy user-service --env prod --version v1.2.3

        # Preview a deployment
        devkit deploy user-service --dry-run

    Common issues:

        If deployment fails with "image not found", ensure the version
        has been built and pushed to the container registry.
    """
    pass
```

### Interactive Mode for Complex Commands

```python
@cli.command()
@click.option('--interactive', '-i', is_flag=True, help='Interactive mode')
def scaffold(interactive: bool):
    """Create a new service from template."""

    if interactive:
        # Use inquirer for interactive prompts
        questions = [
            inquirer.Text('name', message="Service name"),
            inquirer.List(
                'template',
                message="Template",
                choices=['api', 'worker', 'frontend']
            ),
            inquirer.Checkbox(
                'features',
                message="Features to include",
                choices=['database', 'cache', 'queue', 'auth']
            ),
        ]
        answers = inquirer.prompt(questions)
    else:
        # Require arguments in non-interactive mode
        pass

    create_service(**answers)
```

## Principle 6: Measure Everything

### Track What Matters

```python
import analytics
from functools import wraps

def track_usage(command_name: str):
    """Track command usage for improvement insights."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            success = False
            error_type = None

            try:
                result = func(*args, **kwargs)
                success = True
                return result
            except Exception as e:
                error_type = type(e).__name__
                raise
            finally:
                duration = time.time() - start_time
                analytics.track(
                    user_id=get_user_id(),
                    event="command_executed",
                    properties={
                        "command": command_name,
                        "duration_ms": duration * 1000,
                        "success": success,
                        "error_type": error_type,
                        "version": get_tool_version(),
                    }
                )
        return wrapper
    return decorator

@cli.command()
@track_usage("deploy")
def deploy(service: str, env: str):
    """Deploy a service."""
    pass
```

### Build Feedback Loops

```python
@cli.command()
def feedback():
    """Submit feedback about the tool."""

    feedback_type = inquirer.list_input(
        "What kind of feedback?",
        choices=["Bug report", "Feature request", "General feedback"]
    )

    message = inquirer.text(
        message="Tell us more",
        multiline=True
    )

    # Submit to internal feedback system
    submit_feedback(
        type=feedback_type,
        message=message,
        context={
            "tool_version": get_tool_version(),
            "os": platform.system(),
            "recent_commands": get_recent_commands(),
        }
    )

    console.print("[green]Thanks for your feedback![/green]")
```

## The Adoption Checklist

Before launching an internal tool:

### Day 0 (Before Launch)
- [ ] Solves a real pain point (validated with 5+ engineers)
- [ ] Faster than the manual alternative
- [ ] Works in engineers' existing workflow
- [ ] Documentation fits in one page

### Week 1
- [ ] Works reliably for happy path
- [ ] Errors are helpful and actionable
- [ ] Easy to install (one command)
- [ ] Someone on-call for issues

### Month 1
- [ ] Usage metrics being collected
- [ ] Feedback channel established
- [ ] Common issues addressed
- [ ] Power users identified

### Quarter 1
- [ ] 50%+ of target users active
- [ ] Feature requests prioritized
- [ ] Self-service troubleshooting
- [ ] Reduced support burden

## Conclusion

The best internal tools share these qualities:

1. **Obvious value** - Engineers immediately see the benefit
2. **Low friction** - Works in their existing workflow
3. **Fast** - Respects engineers' time
4. **Helpful** - Fails gracefully with good suggestions
5. **Evolving** - Improves based on real usage

Build tools that engineers *want* to use, not tools they're *forced* to use.

---

*Building internal tools? Let's share patterns on [LinkedIn](https://linkedin.com/in/mishrapunit).*
