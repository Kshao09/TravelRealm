import { initializeAuth } from "../JS/Auth/auth.js";

document.addEventListener('DOMContentLoaded', async function() {
    initializeAuth();

    const newPostButton = document.getElementById('new-post-button');
    const forumContainer = document.getElementById('forum-container');
    const categoryLinks = document.querySelectorAll('#categories a');

    const localPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const serverPosts = await loadPostsFromServer();
    const mergedPosts = mergePosts(localPosts, serverPosts);

    let isSavingPosts = false;
    const postStatusMap = new Map();

    mergedPosts.forEach(postData => {
        const post = createPostElement(postData.username, postData.category, postData.content, [], postData.id);

        postData.images.forEach(src => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const img = document.createElement('img');
            img.src = src;

            const removeButton = document.createElement('button');
            removeButton.textContent = "X";
            removeButton.classList.add('remove-image-button');
            removeButton.addEventListener('click', function() {
                imgContainer.remove();
                savePosts();
                savePostsToServer();
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeButton);
            post.appendChild(imgContainer);
        });

        post.querySelector('.reaction-count[data-reaction="up"]').textContent = postData.reactions.up;
        post.querySelector('.reaction-count[data-reaction="down"]').textContent = postData.reactions.down;

        forumContainer.appendChild(post);
    });

    newPostButton.addEventListener('click', async function() {
        const username = document.getElementById('new-post-username').value;
        const category = document.getElementById('new-post-category').value;
        const images = document.getElementById('new-post-image').files;
        const content = document.getElementById('new-post-content').value;

        if (username && content) {
            const post = createPostElement(username, category, content, images);
            forumContainer.appendChild(post);
            savePosts();
            await savePostsToServer();
        } else {
            alert("Please enter your name and post content");
        }
    });

    forumContainer.addEventListener('click', async function(e) {
        if (e.target.classList.contains('reaction-button')) {
            const post = e.target.closest('.forum-post');
            const reaction = e.target.getAttribute('data-reaction');
            const countSpan = e.target.nextElementSibling;
            let count = parseInt(countSpan.textContent);
            count++;
            countSpan.textContent = count;

            const postId = post.getAttribute('data-id');
            const postData = {
                id: postId,
                username: post.querySelector('h3').textContent,
                category: post.getAttribute('data-category'),
                content: post.querySelector('.post-content').textContent,
                images: Array.from(post.querySelectorAll('.image-container img')).map(img => img.src),
                reactions: {
                    up: parseInt(post.querySelector('.reaction-count[data-reaction="up"]').textContent),
                    down: parseInt(post.querySelector('.reaction-count[data-reaction="down"]').textContent)
                }
            };

            savePosts();
            await updatePostToServer(postId, postData);
        } else if (e.target.classList.contains('edit-button')) {
            const post = e.target.closest('.forum-post');
            const contentElement = post.querySelector('.post-content');
            const editButton = e.target;
            const currentContent = contentElement.textContent;
            const currentImages = Array.from(post.querySelectorAll('.image-container img')).map(img => img.src);

            let editForm = post.querySelector('.edit-form');

            if (!editForm) {
                editForm = document.createElement('div');
                editForm.classList.add('edit-form');
                post.appendChild(editForm);
            }

            editForm.innerHTML = '';

            editForm.innerHTML = `<textarea class="edit-content">${currentContent}</textarea>
                                <input type="file" class="edit-image" multiple>
                                <button class="save-edit-button">Save</button>
                                <button class="cancel-edit-button">Cancel</button>`;

            if (currentImages.length > 0) {
                currentImages.forEach(src => {
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('image-container');
                    const img = document.createElement('img');
                    img.src = src;

                    const removeButton = document.createElement('button');
                    removeButton.classList.add('remove-image-button');
                    removeButton.textContent = 'X';
                    removeButton.addEventListener('click', function() {
                        imgContainer.remove();
                        savePosts();
                        savePostsToServer();
                    });

                    editForm.appendChild(imgContainer);
                });
            }

            contentElement.style.display = 'none';
            editButton.style.display = 'none';

            post.querySelector('.save-edit-button').addEventListener('click', async function() {
                const newContent = editForm.querySelector('.edit-content').value;
                const newImages = editForm.querySelector('.edit-image').files;

                contentElement.textContent = newContent;

                post.querySelectorAll('.image-container').forEach(container => container.remove());

                if (newImages.length > 0) {
                    let imagesLoaded = 0;

                    Array.from(newImages).forEach(image => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const imgContainer = document.createElement('div');
                            imgContainer.classList.add('image-container');

                            const img = document.createElement('img');
                            img.src = e.target.result;

                            const removeButton = document.createElement('button');
                            removeButton.textContent = "X";
                            removeButton.classList.add("remove-image-button");
                            removeButton.addEventListener('click', function() {
                                imgContainer.remove();
                                savePosts();
                                savePostsToServer();
                            });

                            imgContainer.appendChild(img);
                            imgContainer.appendChild(removeButton);
                            post.appendChild(imgContainer);

                            imagesLoaded++;

                            if (imagesLoaded === newImages.length) {
                                savePosts();
                                savePostsToServer();
                            }
                        };

                        reader.readAsDataURL(image);
                    });
                } else {
                    currentImages.forEach(src => {
                        const imgContainer = document.createElement('div');
                        imgContainer.classList.add('image-container');
                        const img = document.createElement('img');
                        img.src = src;

                        const removeButton = document.createElement('button');
                        removeButton.textContent = 'X';
                        removeButton.classList.add('remove-image-button');
                        removeButton.addEventListener('click', function() {
                            imgContainer.remove();
                            savePosts();
                            savePostsToServer();
                        });

                        imgContainer.appendChild(img);
                        imgContainer.appendChild(removeButton);
                        post.appendChild(imgContainer);
                    });

                    savePosts();
                    savePostsToServer();
                }

                const postId = post.getAttribute('data-id');
                const postData = {
                    id: postId,
                    username: post.querySelector('h3').textContent,
                    category: post.getAttribute('data-category'),
                    content: newContent,
                    images: Array.from(post.querySelectorAll('.image-container img')).map(img => img.src),
                    reactions: {
                        up: parseInt(post.querySelector('.reaction-count[data-reaction="up"]').textContent),
                        down: parseInt(post.querySelector('.reaction-count[data-reaction="down"]').textContent)
                    }
                };

                await updatePostToServer(postId, postData);

                editForm.remove();
                contentElement.style.display = 'block';
                editButton.style.display = 'block';
            });

            post.querySelector('.cancel-edit-button').addEventListener('click', function() {
                editForm.remove();
                contentElement.style.display = 'block';
                editButton.style.display = 'block';
            });
        } else if (e.target.classList.contains('delete-button')) {
            const post = e.target.closest('.forum-post');
            const postId = post.getAttribute('data-id');
            post.remove();
            deletePost(postId);
            savePosts();
            await deletePostFromServer(postId);
        }
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedCategory = link.getAttribute('data-category');
            filterPosts(selectedCategory);
        });
    });

    function filterPosts(category) {
        const posts = forumContainer.querySelectorAll('.forum-post');
        posts.forEach(post => {
            const postCategory = post.getAttribute('data-category');

            if (category === 'All' || postCategory === category) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    function createPostElement(username, category, content, images, postId = null) {
        const post = document.createElement('div');
        post.classList.add('forum-post');
        post.setAttribute('data-category', category);
        postId = postId || new Date().getTime().toString();
        post.setAttribute('data-id', postId);

        post.innerHTML = `<h3>${username}</h3>
                          <p><strong>Category:</strong> ${category}</p>
                          <p class="post-content">${content}</p>
                          <button class="reaction-button" data-reaction="up">👍</button>
                          <span class="reaction-count" data-reaction="up">0</span>
                          <button class="reaction-button" data-reaction="down">👎</button>
                          <span class="reaction-count" data-reaction="down">0</span>
                          <button class="edit-button">Edit</button>
                          <button class="delete-button">Delete</button>`;

        if (images.length > 0) {
            let imagesLoaded = 0;

            Array.from(images).map(image => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('image-container');

                    const img = document.createElement('img');
                    img.src = e.target.result;

                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'X';
                    removeButton.classList.add('remove-image-button');
                    removeButton.addEventListener('click', function() {
                        imgContainer.remove();
                        savePosts();
                        savePostsToServer();
                    });

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(removeButton);
                    post.appendChild(imgContainer);

                    imagesLoaded++;
                    if (imagesLoaded === images.length) {
                        savePosts();
                        savePostsToServer();
                    }

                    reader.readAsDataURL(image);
                }
            })
        }

        return post;
    }

    function savePosts() {
        const posts = forumContainer.querySelectorAll('.forum-post');
        const postsData = [];

        posts.forEach(post => {
            const username = post.querySelector('h3').textContent;
            const category = post.getAttribute('data-category');
            const content = post.querySelector('.post-content').textContent;
            const images = Array.from(post.querySelectorAll('.image-container img')).map(img => img.src);

            const reactions = {
                up: parseInt(post.querySelector('.reaction-count[data-reaction="up"]').textContent),
                down: parseInt(post.querySelector('.reaction-count[data-reaction="down"]').textContent)
            };

            postsData.push({ id: post.getAttribute('data-id'), username, category, content, images, reactions });
        });

        localStorage.setItem("forumPosts", JSON.stringify(postsData));
    }

    async function savePostsToServer() {
        if (isSavingPosts) return;
        isSavingPosts = true;

        const posts = forumContainer.querySelectorAll('.forum-post');
        const postsData = [];

        posts.forEach(post => {
            const username = post.querySelector('h3').textContent;
            const category = post.getAttribute('data-category');
            const content = post.querySelector('.post-content').textContent;
            const images = Array.from(post.querySelectorAll('.image-container img')).map(img => img.src);

            const reactions = {
                up: parseInt(post.querySelector('.reaction-count[data-reaction="up"]').textContent),
                down: parseInt(post.querySelector('.reaction-count[data-reaction="down"]').textContent)
            };

            postsData.push({ id: post.getAttribute('data-id'), username, category, content, images, reactions });
        });

        try {
            for (const postData of postsData) {
                const exists = await checkIfPostExists(postData.id);

                if (exists) {
                    if (!postStatusMap.has(postData.id) || postStatusMap.get(postData.id) !== 'created') {
                        await updatePostToServer(postData.id, postData);
                        postStatusMap.set(postData.id, 'updated');
                    }
                } else {
                    await createPostOnServer(postData);
                    postStatusMap.set(postData.id, 'created');
                }
            }
        } catch (error) {
            console.error("Failed to save posts to server:", error);
        } finally {
            isSavingPosts = false;
        }
    }

    async function checkIfPostExists(postId) {
        if (!postId) return false;

        try {
            const response = await fetch(`http://localhost:8080/api/check-conversation/${postId}`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                }
            });

            if (response.status === 404) {
                console.log(`Post ID: ${postId} does not exist (404).`);
                return false;
            }

            return response.ok;
        } catch (error) {
            console.error("Failed to check if post exists: ", error);
            return false;
        }
    }

    async function createPostOnServer(postData) {
        try {
            let saveResponse = await fetch(`http://localhost:8080/api/save-conversation`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(postData)
            });

            if (saveResponse.ok) {
                const newPost = await saveResponse.json();
                postData.id = newPost.id;
            } else if (saveResponse.status === 409) {
                console.error("Conflict: Post already exists, should not happen here.");
            } else {
                throw new Error("Failed to create new post on server");
            }
        } catch (error) {
            console.error("Failed to create post on server:", error);
        }
    }

    async function updatePostToServer(postId, postData) {
        try {
            const updateResponse = await fetch(`http://localhost:8080/api/update-conversation/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(postData)
            });

            if (updateResponse.ok) { }
            else if (updateResponse.status === 404) {
                console.error("Post not found on server, cannot update: ", postData.id);
            } else {
                throw new Error("Failed to update post on server");
            }
        } catch (error) {
            console.error("Failed to update post on server: ", error);
        }
    }

    function deletePost(postId) {
        const postsData = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const updatedPostsData = postsData.filter(post => post.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(updatedPostsData));
    }

    async function deletePostFromServer(postId) {
        try {
            const response = await fetch(`http://localhost:8080/api/delete-conversation/${postId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete post from server");
            }
        } catch (error) {
            console.error("Failed to delete post from server: ", error);
        }
    }

    // function loadPosts() {
    //     const localPostsData = JSON.parse(localStorage.getItem('forumPosts')) || [];

    //     localPostsData.forEach(postData => {
    //         const post = createPostElement(postData.username, postData.category, postData.content, [], postData.id);

    //         postData.images.forEach(src => {
    //             const imgContainer = document.createElement('div');
    //             imgContainer.classList.add('image-container');

    //             const img = document.createElement('img');
    //             img.src = src;

    //             const removeButton = document.createElement('button');
    //             removeButton.textContent = 'X';
    //             removeButton.classList.add('remove-image-button');
    //             removeButton.addEventListener('click', function() {
    //                 imgContainer.remove();
    //                 savePosts();
    //                 savePostsToServer();
    //             });

    //             imgContainer.appendChild(img);
    //             imgContainer.appendChild(removeButton);
    //             post.appendChild(imgContainer);
    //         });

    //         post.querySelector('.reaction-count[data-reaction="up"]').textContent = postData.reactions.up;
    //         post.querySelector('.reaction-count[data-reaction="down"]').textContent = postData.reactions.down;

    //         forumContainer.appendChild(post);
    //     });
    // }

    async function loadPostsFromServer() {
        try {
            const response = await fetch('http://localhost:8080/api/load-conversation');
            const serverPostsData = await response.json();

            return serverPostsData.map(postData => ({
                id: postData.id,
                username: postData.username,
                category: postData.category,
                content: postData.content,
                images: postData.images,
                reactions: postData.reactions
            }));
        } catch (error) {
            console.error("Failed to load posts from server: ", error);
            return [];
        }
    }

    function mergePosts(localPosts, serverPosts) {
        const mergedPosts = [...localPosts];

        serverPosts.forEach(serverPost => {
            const exists = localPosts.some(localPost => localPost.id === serverPost.id);

            if (!exists) {
                mergedPosts.push(serverPost);
            }
        });

        return mergedPosts;
    }

    var scrollBtn = document.getElementById('scroll-top-button');

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener('scroll', () => {
        const scrollTopButton = document.getElementById('scroll-top-button');
        if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
            scrollTopButton.style.display = 'block';
        } else {
            scrollTopButton.style.display = 'none';
        }
    });

    const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        element.value = preferredLanguage;
    });
    translatePage(preferredLanguage);

    async function translatePage(language) {
        const elements = document.querySelectorAll('[data-translate]');

        for (const element of elements) {
            const text = element.getAttribute('data-original-text') || element.textContent;
            const translatedText = await translateText(text, language);
            element.textContent = translatedText;
            element.setAttribute('data-original-text', text);
        }
    }

    async function translateText(text, targetLanguage) {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error(error);
        }
    }
});