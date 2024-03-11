# Contributing

Ensure you have `pnpm` installed, then run `pnpm install` to install all dependencies.

## Sender - Rust

The sender is written in Rust, and is located in the `sender` directory.

Install the following rust dependencies:

```sh
rustup target add thumbv6m-none-eabi
cargo install cargo-binutils elf2uf2-rs flip-link
rustup component add llvm-tools-preview
```

## Raspberry PI Pico

To setup the Raspberry PI Pico to be written to by the sender:

- Hold the [BOOTSEL](https://projects.raspberrypi.org/en/projects/getting-started-with-the-pico/3) button while plugging in the USB cable.
