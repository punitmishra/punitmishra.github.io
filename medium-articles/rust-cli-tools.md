# Building Blazing Fast CLI Tools in Rust

*Zero-cost abstractions, single binaries, and sub-second performance*

---

Rust has become my go-to language for CLI tools. The combination of zero-cost abstractions, excellent error handling, and blazing performance makes it ideal for developer tooling. Here's a deep dive into building production-quality CLI applications.

## Why Rust for CLI Tools?

Before we dive in, let's address the "why":

1. **Instant startup** — No runtime to load, unlike Python or Node
2. **Single binary** — Distribute one file, no dependencies
3. **Memory safety** — No segfaults, no undefined behavior
4. **Excellent error handling** — `Result` and `?` make error handling elegant
5. **Cross-compilation** — Build for Linux, macOS, and Windows from one machine

## Project Setup

Let's build a real tool: a fast file search utility similar to `fd`. Start with a new project:

```bash
cargo new rust-find
cd rust-find
```

Add dependencies in `Cargo.toml`:

```toml
[package]
name = "rust-find"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = { version = "4.4", features = ["derive"] }
walkdir = "2.4"
regex = "1.10"
colored = "2.1"
rayon = "1.8"
anyhow = "1.0"
ignore = "0.4"

[profile.release]
lto = true
codegen-units = 1
panic = "abort"
strip = true
```

## Argument Parsing with Clap

Clap's derive macros make argument parsing declarative:

```rust
use clap::Parser;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(name = "rust-find")]
#[command(author = "Punit Mishra")]
#[command(version = "1.0")]
#[command(about = "A blazing fast file finder", long_about = None)]
struct Args {
    /// Pattern to search for (regex supported)
    pattern: String,

    /// Directory to search in
    #[arg(short, long, default_value = ".")]
    path: PathBuf,

    /// Search hidden files and directories
    #[arg(short = 'H', long)]
    hidden: bool,

    /// Maximum depth to search
    #[arg(short, long)]
    max_depth: Option<usize>,

    /// File type to search (f=file, d=directory)
    #[arg(short = 't', long)]
    file_type: Option<char>,

    /// Show file sizes
    #[arg(short, long)]
    size: bool,
}

fn main() {
    let args = Args::parse();
    println!("{:?}", args);
}
```

The derive macro generates comprehensive help output automatically:

```
$ rust-find --help
A blazing fast file finder

Usage: rust-find [OPTIONS] <PATTERN>

Options:
  -p, --path <PATH>        Directory to search in [default: .]
  -H, --hidden             Search hidden files and directories
  -d, --max-depth <DEPTH>  Maximum depth to search
  -t, --file-type <TYPE>   File type (f=file, d=directory)
  -s, --size               Show file sizes
  -h, --help               Print help
  -V, --version            Print version
```

## Parallel File Walking

The real performance comes from parallel directory traversal. Using the `ignore` crate (from ripgrep) gives us gitignore support for free:

```rust
use ignore::WalkBuilder;
use regex::Regex;
use std::sync::atomic::{AtomicUsize, Ordering};

struct FileFinder {
    pattern: Regex,
    args: Args,
    match_count: AtomicUsize,
}

impl FileFinder {
    fn search(&self) -> Result<()> {
        let walker = WalkBuilder::new(&self.args.path)
            .hidden(!self.args.hidden)
            .max_depth(self.args.max_depth)
            .threads(num_cpus::get())
            .build_parallel();

        walker.run(|| {
            Box::new(|entry| {
                if let Ok(entry) = entry {
                    self.process_entry(&entry);
                }
                ignore::WalkState::Continue
            })
        });

        eprintln!(
            "\n{} matches found",
            self.match_count.load(Ordering::SeqCst)
        );
        Ok(())
    }
}
```

## Benchmark: Speed Comparison

Results on a large monorepo (50,000 files):

| Tool | Time | Memory |
|------|------|--------|
| find | 2.3s | 8MB |
| fd | 0.4s | 12MB |
| rust-find | 0.3s | 10MB |

## Command Execution

Adding `-x` support for executing commands on matches:

```rust
use std::process::Command;

fn execute_command(&self, template: &str, path: &Path) -> Result<()> {
    let cmd = template.replace("{}", &path.display().to_string());
    let parts: Vec<&str> = cmd.split_whitespace().collect();

    if parts.is_empty() {
        return Ok(());
    }

    let output = Command::new(parts[0])
        .args(&parts[1..])
        .output()?;

    if !output.stdout.is_empty() {
        print!("{}", String::from_utf8_lossy(&output.stdout));
    }

    Ok(())
}
```

Usage examples:

```bash
# Delete all .tmp files
rust-find '\.tmp$' -x 'rm {}'

# Show line count for all Rust files
rust-find '\.rs$' -x 'wc -l {}'

# Compress all log files
rust-find '\.log$' -x 'gzip {}'
```

## Error Handling with Context

Use `anyhow` for rich error context:

```rust
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let args = Args::parse();

    if !args.path.exists() {
        anyhow::bail!("Path does not exist: {}", args.path.display());
    }

    let finder = FileFinder::new(args)
        .context("Failed to compile search pattern")?;

    finder.search()
        .context("Search failed")?;

    Ok(())
}
```

Error output is now helpful:

```
Error: Failed to compile search pattern

Caused by:
    regex parse error:
        [unclosed
        ^
    error: unclosed character class
```

## Cross-Compilation

Build for all platforms from macOS:

```bash
# Install targets
rustup target add x86_64-unknown-linux-musl
rustup target add x86_64-pc-windows-gnu
rustup target add aarch64-apple-darwin

# Build all
cargo build --release --target x86_64-unknown-linux-musl
cargo build --release --target x86_64-pc-windows-gnu
cargo build --release --target aarch64-apple-darwin
```

## Release Optimization

The `Cargo.toml` profile settings give us:

- **LTO** (Link-Time Optimization): Cross-crate inlining
- **Single codegen unit**: Better optimization
- **Abort on panic**: Smaller binary
- **Strip symbols**: Smaller binary

Binary sizes:

| Build | Size |
|-------|------|
| Debug | 8.2MB |
| Release | 2.1MB |
| Release + strip | 1.4MB |

## Key Takeaways

1. **Use `clap` derive** — Declarative argument parsing with automatic help
2. **Parallel by default** — `rayon` and `ignore` make parallelism easy
3. **Rich errors** — `anyhow` with `.context()` for debugging
4. **Cross-compile** — One codebase, all platforms
5. **Optimize release builds** — LTO + strip for small binaries

The complete source is available at [github.com/punitmishra/rust-find](https://github.com/punitmishra/rust-find). The patterns here apply to any CLI tool—I use them for everything from build tools to data pipelines.

---

*Originally published at [punitmishra.github.io](https://punitmishra.github.io/blog/rust-cli-tools)*
